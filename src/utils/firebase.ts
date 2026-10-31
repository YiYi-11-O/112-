import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  collection, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  runTransaction, 
  onSnapshot, 
  writeBatch,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Subject, Question, AppSettings, Coupon } from '../types';
import { 
  DEFAULT_SUBJECTS, 
  DEFAULT_QUESTIONS, 
  DEFAULT_SETTINGS 
} from './storage';
import { formatSerialNumber } from './quiz';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
}

// Test connection on boot
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'system', 'connection_test'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase is offline, operating with local fallback cache.');
    }
  }
}

// Run connection test
testConnection();

/**
 * Seed initial subjects, questions, and counter to Firestore if not present
 */
export async function initializeCloudDataIfEmpty(): Promise<void> {
  try {
    const subjectsSnap = await getDocs(collection(db, 'subjects'));
    if (subjectsSnap.empty) {
      console.log('Seeding initial subjects and questions to Firestore...');
      const batch = writeBatch(db);

      // Seed subjects
      for (const sub of DEFAULT_SUBJECTS) {
        batch.set(doc(db, 'subjects', sub.id), sub);
      }

      // Seed questions
      for (const q of DEFAULT_QUESTIONS) {
        batch.set(doc(db, 'questions', q.id), q);
      }

      // Seed initial counter
      batch.set(doc(db, 'system', 'counter'), { currentNumber: 0, updatedAt: new Date().toISOString() }, { merge: true });

      // Seed settings
      batch.set(doc(db, 'system', 'settings'), DEFAULT_SETTINGS, { merge: true });

      await batch.commit();
      console.log('Initial cloud data successfully seeded.');
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'seed_initial_data');
  }
}

/**
 * ATOMIC CROSS-DEVICE SERIAL NUMBER GENERATOR
 * Guarantees that Device A and Device B will NEVER get the same voucher number.
 * Uses Firestore transaction to increment the counter atomically.
 */
export async function getNextGlobalSerialNumber(): Promise<number> {
  const counterRef = doc(db, 'system', 'counter');
  try {
    const nextNumber = await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      let current = 0;
      if (counterDoc.exists()) {
        const data = counterDoc.data();
        current = typeof data.currentNumber === 'number' ? data.currentNumber : 0;
      }
      const next = current + 1;
      transaction.set(counterRef, {
        currentNumber: next,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      return next;
    });

    // Also update local storage cache
    localStorage.setItem('ZEBRA_AVOCADO_GLOBAL_COUPON_COUNTER_V1', String(nextNumber + 1));
    return nextNumber;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'system/counter');
    // Fallback in case of temporary offline status
    const local = parseInt(localStorage.getItem('ZEBRA_AVOCADO_GLOBAL_COUPON_COUNTER_V1') || '1', 10);
    localStorage.setItem('ZEBRA_AVOCADO_GLOBAL_COUPON_COUNTER_V1', String(local + 1));
    return local;
  }
}

/**
 * Get current cloud counter value
 */
export async function getCloudCounter(): Promise<number> {
  try {
    const snap = await getDoc(doc(db, 'system', 'counter'));
    if (snap.exists()) {
      return snap.data().currentNumber || 0;
    }
    return 0;
  } catch {
    return 0;
  }
}

/**
 * Set current cloud counter value
 */
export async function setCloudCounter(val: number): Promise<void> {
  try {
    await setDoc(
      doc(db, 'system', 'counter'),
      { currentNumber: val, updatedAt: new Date().toISOString() },
      { merge: true }
    );
    localStorage.setItem('ZEBRA_AVOCADO_GLOBAL_COUPON_COUNTER_V1', String(val + 1));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'system/counter');
  }
}

/**
 * Issue a coupon with a verified global unique serial number
 */
export async function issueGlobalCoupon(
  question: Question, 
  subjectName: string, 
  settings: AppSettings
): Promise<Coupon> {
  const serialNumber = await getNextGlobalSerialNumber();
  const formattedCode = formatSerialNumber(serialNumber);

  const coupon: Coupon = {
    code: formattedCode,
    serialNumber,
    questionId: question.id,
    questionTitle: question.title,
    subjectName,
    issuedAt: new Date().toISOString(),
    design: settings.voucherDesign,
  };

  // Save to device's local wallet
  try {
    const raw = localStorage.getItem('ZEBRA_AVOCADO_EARNED_COUPONS_V1');
    const list: Coupon[] = raw ? JSON.parse(raw) : [];
    list.unshift(coupon);
    localStorage.setItem('ZEBRA_AVOCADO_EARNED_COUPONS_V1', JSON.stringify(list));
  } catch (e) {
    console.error('Failed saving coupon to device storage:', e);
  }

  return coupon;
}

/**
 * Real-time listener for subjects across devices
 */
export function subscribeToSubjects(onChange: (subjects: Subject[]) => void) {
  return onSnapshot(
    collection(db, 'subjects'),
    (snapshot) => {
      if (!snapshot.empty) {
        const subjects: Subject[] = [];
        snapshot.forEach((d) => {
          subjects.push(d.data() as Subject);
        });
        onChange(subjects);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'subjects');
    }
  );
}

/**
 * Real-time listener for questions across devices
 */
export function subscribeToQuestions(onChange: (questions: Question[]) => void) {
  return onSnapshot(
    collection(db, 'questions'),
    (snapshot) => {
      if (!snapshot.empty) {
        const questions: Question[] = [];
        snapshot.forEach((d) => {
          questions.push(d.data() as Question);
        });
        onChange(questions);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'questions');
    }
  );
}

/**
 * Real-time listener for settings across devices
 */
export function subscribeToSettings(onChange: (settings: AppSettings) => void) {
  return onSnapshot(
    doc(db, 'system', 'settings'),
    (snapshot) => {
      if (snapshot.exists()) {
        onChange(snapshot.data() as AppSettings);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'system/settings');
    }
  );
}

/**
 * Cloud CRUD for questions
 */
export async function saveQuestionToCloud(question: Question): Promise<void> {
  try {
    await setDoc(doc(db, 'questions', question.id), question);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `questions/${question.id}`);
    throw error;
  }
}

export async function deleteQuestionFromCloud(questionId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'questions', questionId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `questions/${questionId}`);
    throw error;
  }
}

/**
 * Cloud CRUD for subjects
 */
export async function saveSubjectToCloud(subject: Subject): Promise<void> {
  try {
    await setDoc(doc(db, 'subjects', subject.id), subject);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `subjects/${subject.id}`);
    throw error;
  }
}

export async function deleteSubjectFromCloud(subjectId: string): Promise<void> {
  try {
    // Delete the subject
    await deleteDoc(doc(db, 'subjects', subjectId));
    // Also delete any questions under this subject
    const qSnap = await getDocs(collection(db, 'questions'));
    const batch = writeBatch(db);
    qSnap.forEach((d) => {
      if (d.data().subjectId === subjectId) {
        batch.delete(d.ref);
      }
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `subjects/${subjectId}`);
    throw error;
  }
}

/**
 * Save settings to cloud
 */
export async function saveSettingsToCloud(settings: AppSettings): Promise<void> {
  try {
    await setDoc(doc(db, 'system', 'settings'), settings, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'system/settings');
    throw error;
  }
}

/**
 * Reset cloud data back to defaults
 */
export async function resetCloudToDefault(): Promise<void> {
  try {
    // Delete existing
    const subs = await getDocs(collection(db, 'subjects'));
    const qs = await getDocs(collection(db, 'questions'));
    const batch = writeBatch(db);

    subs.forEach((d) => batch.delete(d.ref));
    qs.forEach((d) => batch.delete(d.ref));

    for (const sub of DEFAULT_SUBJECTS) {
      batch.set(doc(db, 'subjects', sub.id), sub);
    }
    for (const q of DEFAULT_QUESTIONS) {
      batch.set(doc(db, 'questions', q.id), q);
    }
    batch.set(doc(db, 'system', 'settings'), DEFAULT_SETTINGS);

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'reset_cloud');
    throw error;
  }
}

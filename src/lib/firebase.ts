import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  getDoc,
  deleteDoc, 
  query, 
  orderBy,
  Firestore 
} from 'firebase/firestore';
import type { DecisaoJudicialVD, ProcessoCorrespondencia } from '../types/judicial';
import type { DiplomaLegislativo, ReferenciaDoutrinaria, ContactoUtil, AcordaoJurisprudencia } from '../types/modules';
import { LEGISLACAO_INICIAL } from '../data/defaultLegislacao';
import { DOUTRINA_INICIAL } from '../data/defaultDoutrina';
import { CONTACTOS_INICIAIS } from '../data/defaultContactos';
import { JURISPRUDENCIA_INICIAL } from '../data/defaultJurisprudencia';

// Load configuration
let firebaseConfig: Record<string, any> = {};

try {
  // @ts-ignore - JSON import
  import('../../firebase-applet-config.json').then((module) => {
    firebaseConfig = module.default || module;
  });
} catch {
  // Fallback defaults if static import is pending
}

const fallbackConfig = {
  projectId: "vd-form",
  appId: "1:324251814660:web:269c877f18d2ef63721e51",
  apiKey: "AIzaSyBO0P1Lv8a4QEEGi_t9Pd6CWQkKtt6tL0w",
  authDomain: "vd-form.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-4adf69c5-7b9b-49e6-8ac8-481749f2610b",
  storageBucket: "vd-form.firebasestorage.app",
  messagingSenderId: "324251814660",
};

export function getFirebaseApp() {
  const activeConfig = Object.keys(firebaseConfig).length > 0 ? firebaseConfig : fallbackConfig;
  if (!getApps().length) {
    return initializeApp(activeConfig);
  }
  return getApp();
}

let dbInstance: Firestore | null = null;

export function getAppFirestore(): Firestore {
  if (!dbInstance) {
    const app = getFirebaseApp();
    const activeConfig = Object.keys(firebaseConfig).length > 0 ? firebaseConfig : fallbackConfig;
    const dbId = activeConfig.firestoreDatabaseId;
    if (dbId && dbId !== '(default)') {
      try {
        dbInstance = getFirestore(app, dbId);
      } catch (err) {
        console.warn('Fallback to default Firestore database:', err);
        dbInstance = getFirestore(app);
      }
    } else {
      dbInstance = getFirestore(app);
    }
  }
  return dbInstance;
}

// Local Storage backup keys for offline resiliency
const LOCAL_STORAGE_DECISIONS_KEY = 'vd_form_decisoes_cache';
const LOCAL_STORAGE_MAPPINGS_KEY = 'vd_form_mappings_cache';
const LOCAL_STORAGE_LEGIS_KEY = 'vd_form_legislacao_cache';
const LOCAL_STORAGE_LEGIS_PENDENTE_KEY = 'vd_form_legislacao_pendente_cache';
const LOCAL_STORAGE_DOUTRINA_KEY = 'vd_form_doutrina_cache';
const LOCAL_STORAGE_DOUTRINA_PENDENTE_KEY = 'vd_form_doutrina_pendente_cache';
const LOCAL_STORAGE_JURIS_KEY = 'vd_form_jurisprudencia_cache';
const LOCAL_STORAGE_CONTACTOS_KEY = 'vd_form_contactos_cache';
const LOCAL_STORAGE_LAST_LEGIS_CHECK = 'vd_form_last_legis_check';
const LOCAL_STORAGE_CLEARED_LEGIS_DOUTRINA_KEY = 'vd_limpeza_inicial_legis_doutrina_v2';
const LOCAL_STORAGE_CLEARED_LEGIS_KEY = 'vd_limpeza_inicial_legis_v3';
const LOCAL_STORAGE_CLEARED_DOUTRINA_KEY = 'vd_limpeza_inicial_doutrina_v3';
const LOCAL_STORAGE_CLEARED_JURIS_KEY = 'vd_limpeza_inicial_juris_v3';

export async function salvarDecisaoFirestore(decisao: DecisaoJudicialVD): Promise<boolean> {
  try {
    const db = getAppFirestore();
    const docRef = doc(db, 'decisoes_vd', decisao.seqId);
    
    // Clean undefined fields for Firestore
    const sanitized = JSON.parse(JSON.stringify(decisao));
    await setDoc(docRef, {
      ...sanitized,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    // Save locally
    salvarLocalmenteDecisao(decisao);
    return true;
  } catch (error) {
    console.warn('Aviso: Erro ao sincronizar com Firestore, gravando em cache local:', error);
    salvarLocalmenteDecisao(decisao);
    return false;
  }
}

export async function salvarMapeamentoAdminFirestore(mapping: ProcessoCorrespondencia): Promise<boolean> {
  try {
    const db = getAppFirestore();
    const docRef = doc(db, 'processo_mappings', mapping.seqId);
    const sanitized = JSON.parse(JSON.stringify(mapping));
    await setDoc(docRef, {
      ...sanitized,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    salvarLocalmenteMapeamento(mapping);
    return true;
  } catch (error) {
    console.warn('Aviso: Erro ao sincronizar mapeamento com Firestore, gravando em cache local:', error);
    salvarLocalmenteMapeamento(mapping);
    return false;
  }
}

export async function carregarDecisoes(): Promise<DecisaoJudicialVD[]> {
  try {
    const db = getAppFirestore();
    const q = query(collection(db, 'decisoes_vd'), orderBy('seqNumber', 'asc'));
    const snapshot = await getDocs(q);
    
    const list: DecisaoJudicialVD[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as DecisaoJudicialVD);
    });
    // Atualizar e sincronizar cache local com o estado real do Firestore
    localStorage.setItem(LOCAL_STORAGE_DECISIONS_KEY, JSON.stringify(list));
    return list;
  } catch (error) {
    console.warn('Firestore indisponível, recorrendo a cache local:', error);
    const local = localStorage.getItem(LOCAL_STORAGE_DECISIONS_KEY);
    return local ? JSON.parse(local) : [];
  }
}

export async function carregarMapeamentosAdmin(): Promise<ProcessoCorrespondencia[]> {
  try {
    const db = getAppFirestore();
    const q = query(collection(db, 'processo_mappings'), orderBy('seqNumber', 'asc'));
    const snapshot = await getDocs(q);
    
    const list: ProcessoCorrespondencia[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as ProcessoCorrespondencia);
    });
    // Atualizar e sincronizar cache local com o estado real do Firestore
    localStorage.setItem(LOCAL_STORAGE_MAPPINGS_KEY, JSON.stringify(list));
    return list;
  } catch (error) {
    console.warn('Firestore mapeamentos indisponível, recorrendo a cache local:', error);
    const local = localStorage.getItem(LOCAL_STORAGE_MAPPINGS_KEY);
    return local ? JSON.parse(local) : [];
  }
}

export async function limparTodaBaseDeDados(): Promise<boolean> {
  try {
    const db = getAppFirestore();
    
    // 1. Decisões e mapeamentos
    const decisoesSnap = await getDocs(collection(db, 'decisoes_vd'));
    const p1 = decisoesSnap.docs.map(d => deleteDoc(d.ref));
    const mappingsSnap = await getDocs(collection(db, 'processo_mappings'));
    const p2 = mappingsSnap.docs.map(d => deleteDoc(d.ref));
    
    // 2. Legislação ativa e pendente
    const legSnap = await getDocs(collection(db, 'legislacao_vd'));
    const p3 = legSnap.docs.map(d => deleteDoc(d.ref));
    const legPendSnap = await getDocs(collection(db, 'legislacao_pendente_vd'));
    const p4 = legPendSnap.docs.map(d => deleteDoc(d.ref));
    
    // 3. Jurisprudência
    const jurSnap = await getDocs(collection(db, 'jurisprudencia_vd'));
    const p5 = jurSnap.docs.map(d => deleteDoc(d.ref));
    
    // 4. Doutrina ativa e pendente
    const douSnap = await getDocs(collection(db, 'doutrina_vd'));
    const p6 = douSnap.docs.map(d => deleteDoc(d.ref));
    const douPendSnap = await getDocs(collection(db, 'doutrina_pendente_vd'));
    const p7 = douPendSnap.docs.map(d => deleteDoc(d.ref));
    
    await Promise.all([...p1, ...p2, ...p3, ...p4, ...p5, ...p6, ...p7]);
  } catch (err) {
    console.warn('Erro ao limpar Firestore:', err);
  }
  
  localStorage.removeItem(LOCAL_STORAGE_DECISIONS_KEY);
  localStorage.removeItem(LOCAL_STORAGE_MAPPINGS_KEY);
  localStorage.removeItem(LOCAL_STORAGE_LEGIS_KEY);
  localStorage.removeItem(LOCAL_STORAGE_LEGIS_PENDENTE_KEY);
  localStorage.removeItem(LOCAL_STORAGE_JURIS_KEY);
  localStorage.removeItem(LOCAL_STORAGE_DOUTRINA_KEY);
  localStorage.removeItem(LOCAL_STORAGE_DOUTRINA_PENDENTE_KEY);
  
  localStorage.setItem(LOCAL_STORAGE_CLEARED_LEGIS_KEY, 'true');
  localStorage.setItem(LOCAL_STORAGE_CLEARED_DOUTRINA_KEY, 'true');
  localStorage.setItem(LOCAL_STORAGE_CLEARED_JURIS_KEY, 'true');
  
  return true;
}

export async function eliminarDecisao(seqId: string): Promise<boolean> {
  try {
    const db = getAppFirestore();
    await deleteDoc(doc(db, 'decisoes_vd', seqId));
    await deleteDoc(doc(db, 'processo_mappings', seqId));
  } catch (err) {
    console.warn('Erro ao eliminar no Firestore:', err);
  }
  
  // Remove from local storage
  const localDecisions: DecisaoJudicialVD[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_DECISIONS_KEY) || '[]');
  const updatedD = localDecisions.filter(d => d.seqId !== seqId);
  localStorage.setItem(LOCAL_STORAGE_DECISIONS_KEY, JSON.stringify(updatedD));

  const localMappings: ProcessoCorrespondencia[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_MAPPINGS_KEY) || '[]');
  const updatedM = localMappings.filter(m => m.seqId !== seqId);
  localStorage.setItem(LOCAL_STORAGE_MAPPINGS_KEY, JSON.stringify(updatedM));

  return true;
}

function salvarLocalmenteDecisao(decisao: DecisaoJudicialVD) {
  try {
    const current: DecisaoJudicialVD[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_DECISIONS_KEY) || '[]');
    const index = current.findIndex(d => d.seqId === decisao.seqId);
    if (index >= 0) {
      current[index] = decisao;
    } else {
      current.push(decisao);
    }
    localStorage.setItem(LOCAL_STORAGE_DECISIONS_KEY, JSON.stringify(current));
  } catch (e) {
    console.error('Falha ao guardar decisao localmente:', e);
  }
}

function salvarLocalmenteMapeamento(mapping: ProcessoCorrespondencia) {
  try {
    const current: ProcessoCorrespondencia[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_MAPPINGS_KEY) || '[]');
    const index = current.findIndex(m => m.seqId === mapping.seqId);
    if (index >= 0) {
      current[index] = mapping;
    } else {
      current.push(mapping);
    }
    localStorage.setItem(LOCAL_STORAGE_MAPPINGS_KEY, JSON.stringify(current));
  } catch (e) {
    console.error('Falha ao guardar mapeamento localmente:', e);
  }
}

// ==========================================
// MÓDULO LEGISLAÇÃO: CARREGAR, SINCRONIZAR, LIMPAR & VALIDAÇÃO
// ==========================================

export async function limparModuloLegislacao(): Promise<boolean> {
  try {
    const db = getAppFirestore();
    const snapshot = await getDocs(collection(db, 'legislacao_vd'));
    for (const docSnap of snapshot.docs) {
      await deleteDoc(doc(db, 'legislacao_vd', docSnap.id)).catch(() => {});
    }
    const snapPend = await getDocs(collection(db, 'legislacao_pendente_vd'));
    for (const docSnap of snapPend.docs) {
      await deleteDoc(doc(db, 'legislacao_pendente_vd', docSnap.id)).catch(() => {});
    }
  } catch (err) {
    console.warn('Erro ao limpar coleção de legislação no Firestore:', err);
  }

  try {
    localStorage.removeItem(LOCAL_STORAGE_LEGIS_KEY);
    localStorage.removeItem(LOCAL_STORAGE_LEGIS_PENDENTE_KEY);
    localStorage.setItem(LOCAL_STORAGE_CLEARED_LEGIS_KEY, 'true');
  } catch {}
  return true;
}

export async function sincronizarComPowerlex(): Promise<DiplomaLegislativo[]> {
  try {
    const db = getAppFirestore();
    localStorage.removeItem(LOCAL_STORAGE_CLEARED_LEGIS_KEY);
    
    const writePromises = LEGISLACAO_INICIAL.map(d => {
      return setDoc(doc(db, 'legislacao_vd', d.id), d, { merge: true });
    });
    await Promise.all(writePromises);
    
    localStorage.setItem(LOCAL_STORAGE_LEGIS_KEY, JSON.stringify(LEGISLACAO_INICIAL));
    return LEGISLACAO_INICIAL;
  } catch (err) {
    console.error('Erro ao sincronizar com Powerlex:', err);
    return [];
  }
}

export async function carregarLegislacao(): Promise<DiplomaLegislativo[]> {
  // Se o utilizador limpou o módulo explicitamente, mantém vazio
  if (localStorage.getItem(LOCAL_STORAGE_CLEARED_LEGIS_KEY) === 'true') {
    return [];
  }

  let list: DiplomaLegislativo[] = [];
  try {
    const db = getAppFirestore();
    const snapshot = await getDocs(collection(db, 'legislacao_vd'));
    if (!snapshot.empty) {
      snapshot.forEach(docSnap => {
        list.push(docSnap.data() as DiplomaLegislativo);
      });
      localStorage.setItem(LOCAL_STORAGE_LEGIS_KEY, JSON.stringify(list));
      return list;
    } else {
      localStorage.setItem(LOCAL_STORAGE_LEGIS_KEY, JSON.stringify([]));
      return [];
    }
  } catch (err) {
    console.warn('Firestore legislacao indisponível, recorrendo a cache:', err);
  }

  const local = localStorage.getItem(LOCAL_STORAGE_LEGIS_KEY);
  if (local) {
    try {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }

  return [];
}

export async function salvarDiplomaLegislativo(diploma: DiplomaLegislativo): Promise<boolean> {
  try {
    const db = getAppFirestore();
    await setDoc(doc(db, 'legislacao_vd', diploma.id), diploma, { merge: true });
  } catch (err) {
    console.warn('Erro ao guardar diploma no Firestore:', err);
  }
  try {
    const local: DiplomaLegislativo[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LEGIS_KEY) || '[]');
    const idx = local.findIndex(l => l.id === diploma.id);
    if (idx >= 0) local[idx] = diploma;
    else local.unshift(diploma);
    localStorage.setItem(LOCAL_STORAGE_LEGIS_KEY, JSON.stringify(local));
  } catch (err) {
    console.error('Erro ao salvar localmente:', err);
  }
  return true;
}

export async function eliminarDiplomaLegislativo(id: string): Promise<boolean> {
  try {
    const db = getAppFirestore();
    await deleteDoc(doc(db, 'legislacao_vd', id));
  } catch (err) {
    console.warn('Erro ao eliminar diploma no Firestore:', err);
  }
  try {
    const local: DiplomaLegislativo[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LEGIS_KEY) || '[]');
    const updated = local.filter(l => l.id !== id);
    localStorage.setItem(LOCAL_STORAGE_LEGIS_KEY, JSON.stringify(updated));
  } catch {}
  return true;
}

export async function carregarLegislacaoPendente(): Promise<DiplomaLegislativo[]> {
  try {
    const db = getAppFirestore();
    const snapshot = await getDocs(collection(db, 'legislacao_pendente_vd'));
    if (!snapshot.empty) {
      const list: DiplomaLegislativo[] = [];
      snapshot.forEach(docSnap => {
        list.push(docSnap.data() as DiplomaLegislativo);
      });
      localStorage.setItem(LOCAL_STORAGE_LEGIS_PENDENTE_KEY, JSON.stringify(list));
      return list;
    }
  } catch (err) {
    console.warn('Firestore legislacao_pendente indisponível, usando cache:', err);
  }

  const local = localStorage.getItem(LOCAL_STORAGE_LEGIS_PENDENTE_KEY);
  if (local) {
    try {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }

  return [];
}

export async function salvarLegislacaoPendente(itens: DiplomaLegislativo[]): Promise<boolean> {
  try {
    const db = getAppFirestore();
    for (const item of itens) {
      await setDoc(doc(db, 'legislacao_pendente_vd', item.id), item, { merge: true });
    }
  } catch (err) {
    console.warn('Erro ao salvar legislação pendente no Firestore:', err);
  }

  try {
    localStorage.setItem(LOCAL_STORAGE_LEGIS_PENDENTE_KEY, JSON.stringify(itens));
  } catch (err) {
    console.error('Erro ao gravar cache de legislação pendente:', err);
  }
  return true;
}

export async function aprovarLegislacaoItem(item: DiplomaLegislativo): Promise<boolean> {
  const itemAprovado: DiplomaLegislativo = {
    ...item,
    statusValidacao: 'validado'
  };

  await salvarDiplomaLegislativo(itemAprovado);

  try {
    const db = getAppFirestore();
    await deleteDoc(doc(db, 'legislacao_pendente_vd', item.id));
  } catch {}

  try {
    const local: DiplomaLegislativo[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LEGIS_PENDENTE_KEY) || '[]');
    const updated = local.filter(d => d.id !== item.id);
    localStorage.setItem(LOCAL_STORAGE_LEGIS_PENDENTE_KEY, JSON.stringify(updated));
  } catch {}

  return true;
}

export async function aprovarTodasLegislacoes(itens: DiplomaLegislativo[]): Promise<DiplomaLegislativo[]> {
  const itensAprovados: DiplomaLegislativo[] = itens.map(item => ({
    ...item,
    statusValidacao: 'validado'
  }));

  try {
    const db = getAppFirestore();
    for (const item of itensAprovados) {
      await setDoc(doc(db, 'legislacao_vd', item.id), item, { merge: true });
    }
  } catch (err) {
    console.warn('Erro ao salvar diplomas em lote no Firestore:', err);
  }

  try {
    const local: DiplomaLegislativo[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LEGIS_KEY) || '[]');
    const mapa = new Map<string, DiplomaLegislativo>();
    for (const d of local) mapa.set(d.id, d);
    for (const d of itensAprovados) mapa.set(d.id, d);
    const combinada = Array.from(mapa.values());
    localStorage.setItem(LOCAL_STORAGE_LEGIS_KEY, JSON.stringify(combinada));
  } catch (err) {
    console.error('Erro ao salvar cache de legislação:', err);
  }

  try {
    const db = getAppFirestore();
    for (const item of itens) {
      await deleteDoc(doc(db, 'legislacao_pendente_vd', item.id)).catch(() => {});
    }
  } catch {}

  try {
    localStorage.setItem(LOCAL_STORAGE_LEGIS_PENDENTE_KEY, JSON.stringify([]));
  } catch {}

  return itensAprovados;
}

export async function rejeitarLegislacaoItem(id: string): Promise<boolean> {
  try {
    const db = getAppFirestore();
    await deleteDoc(doc(db, 'legislacao_pendente_vd', id));
  } catch {}

  try {
    const local: DiplomaLegislativo[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LEGIS_PENDENTE_KEY) || '[]');
    const updated = local.filter(d => d.id !== id);
    localStorage.setItem(LOCAL_STORAGE_LEGIS_PENDENTE_KEY, JSON.stringify(updated));
  } catch {}

  return true;
}

export function obterDataUltimaVerificacaoLegis(): string {
  const guardada = localStorage.getItem(LOCAL_STORAGE_LAST_LEGIS_CHECK);
  if (guardada) return guardada;
  const hoje = new Date().toISOString().split('T')[0];
  localStorage.setItem(LOCAL_STORAGE_LAST_LEGIS_CHECK, hoje);
  return hoje;
}

export function registarVerificacaoDiariaLegis(): string {
  const agora = new Date().toISOString();
  localStorage.setItem(LOCAL_STORAGE_LAST_LEGIS_CHECK, agora);
  return agora;
}

// ==========================================
// MÓDULO DOUTRINA: CARREGAR, CRIAR, LIMPAR & ELIMINAR
// ==========================================

export async function limparModuloDoutrina(): Promise<boolean> {
  try {
    const db = getAppFirestore();
    const snapshot = await getDocs(collection(db, 'doutrina_vd'));
    for (const docSnap of snapshot.docs) {
      await deleteDoc(doc(db, 'doutrina_vd', docSnap.id)).catch(() => {});
    }
    const snapPend = await getDocs(collection(db, 'doutrina_pendente_vd'));
    for (const docSnap of snapPend.docs) {
      await deleteDoc(doc(db, 'doutrina_pendente_vd', docSnap.id)).catch(() => {});
    }
  } catch (err) {
    console.warn('Erro ao limpar coleções de doutrina no Firestore:', err);
  }

  try {
    localStorage.removeItem(LOCAL_STORAGE_DOUTRINA_KEY);
    localStorage.removeItem(LOCAL_STORAGE_DOUTRINA_PENDENTE_KEY);
    localStorage.setItem(LOCAL_STORAGE_CLEARED_DOUTRINA_KEY, 'true');
  } catch {}
  return true;
}

export async function carregarDoutrina(): Promise<ReferenciaDoutrinaria[]> {
  // Se o utilizador limpou o módulo de doutrina, mantém vazio
  if (localStorage.getItem(LOCAL_STORAGE_CLEARED_DOUTRINA_KEY) === 'true') {
    return [];
  }

  try {
    const db = getAppFirestore();
    const snapshot = await getDocs(collection(db, 'doutrina_vd'));
    if (!snapshot.empty) {
      const list: ReferenciaDoutrinaria[] = [];
      snapshot.forEach(docSnap => {
        list.push(docSnap.data() as ReferenciaDoutrinaria);
      });
      list.sort((a, b) => Number(b.anoEdicao || 0) - Number(a.anoEdicao || 0));
      localStorage.setItem(LOCAL_STORAGE_DOUTRINA_KEY, JSON.stringify(list));
      return list;
    }
  } catch (err) {
    console.warn('Firestore doutrina indisponível, recorrendo a cache:', err);
  }

  const local = localStorage.getItem(LOCAL_STORAGE_DOUTRINA_KEY);
  if (local) {
    try {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {}
  }

  return [];
}

export async function salvarReferenciaDoutrinaria(doutrina: ReferenciaDoutrinaria): Promise<boolean> {
  try {
    const db = getAppFirestore();
    await setDoc(doc(db, 'doutrina_vd', doutrina.id), doutrina, { merge: true });
    localStorage.removeItem(LOCAL_STORAGE_CLEARED_DOUTRINA_KEY);
  } catch (err) {
    console.warn('Erro ao salvar doutrina no Firestore:', err);
  }

  try {
    const local: ReferenciaDoutrinaria[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_DOUTRINA_KEY) || '[]');
    const idx = local.findIndex(d => d.id === doutrina.id);
    if (idx >= 0) local[idx] = doutrina;
    else local.unshift(doutrina);
    localStorage.setItem(LOCAL_STORAGE_DOUTRINA_KEY, JSON.stringify(local));
  } catch (err) {
    console.error('Erro ao salvar doutrina localmente:', err);
  }
  return true;
}

export async function eliminarReferenciaDoutrinaria(id: string): Promise<boolean> {
  try {
    const db = getAppFirestore();
    await deleteDoc(doc(db, 'doutrina_vd', id));
  } catch (err) {
    console.warn('Erro ao eliminar doutrina no Firestore:', err);
  }

  try {
    const local: ReferenciaDoutrinaria[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_DOUTRINA_KEY) || '[]');
    const updated = local.filter(d => d.id !== id);
    localStorage.setItem(LOCAL_STORAGE_DOUTRINA_KEY, JSON.stringify(updated));
  } catch (err) {}
  return true;
}

// ==========================================
// MÓDULO CONTACTOS ÚTEIS: CARREGAR, CRIAR, ELIMINAR
// ==========================================

export async function carregarContactos(): Promise<ContactoUtil[]> {
  try {
    const db = getAppFirestore();
    const snapshot = await getDocs(collection(db, 'contactos_uteis_vd'));
    if (!snapshot.empty) {
      const list: ContactoUtil[] = [];
      snapshot.forEach(docSnap => {
        list.push(docSnap.data() as ContactoUtil);
      });
      list.sort((a, b) => a.nome.localeCompare(b.nome));
      localStorage.setItem(LOCAL_STORAGE_CONTACTOS_KEY, JSON.stringify(list));
      return list;
    }
  } catch (err) {
    console.warn('Firestore contactos indisponível, recorrendo a cache/padrão:', err);
  }

  const local = localStorage.getItem(LOCAL_STORAGE_CONTACTOS_KEY);
  if (local) {
    try {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {}
  }

  localStorage.setItem(LOCAL_STORAGE_CONTACTOS_KEY, JSON.stringify(CONTACTOS_INICIAIS));
  try {
    const db = getAppFirestore();
    for (const c of CONTACTOS_INICIAIS) {
      setDoc(doc(db, 'contactos_uteis_vd', c.id), c, { merge: true }).catch(() => {});
    }
  } catch {}

  return CONTACTOS_INICIAIS;
}

export async function salvarContactoUtil(contacto: ContactoUtil): Promise<boolean> {
  try {
    const db = getAppFirestore();
    await setDoc(doc(db, 'contactos_uteis_vd', contacto.id), contacto, { merge: true });
  } catch (err) {
    console.warn('Erro ao salvar contacto no Firestore:', err);
  }

  try {
    const local: ContactoUtil[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_CONTACTOS_KEY) || '[]');
    const idx = local.findIndex(c => c.id === contacto.id);
    if (idx >= 0) local[idx] = contacto;
    else local.push(contacto);
    localStorage.setItem(LOCAL_STORAGE_CONTACTOS_KEY, JSON.stringify(local));
  } catch (err) {
    console.error('Erro ao salvar contacto localmente:', err);
  }
  return true;
}

export async function eliminarContactoUtil(id: string): Promise<boolean> {
  try {
    const db = getAppFirestore();
    await deleteDoc(doc(db, 'contactos_uteis_vd', id));
  } catch (err) {
    console.warn('Erro ao eliminar contacto no Firestore:', err);
  }

  try {
    const local: ContactoUtil[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_CONTACTOS_KEY) || '[]');
    const updated = local.filter(c => c.id !== id);
    localStorage.setItem(LOCAL_STORAGE_CONTACTOS_KEY, JSON.stringify(updated));
  } catch (err) {}
  return true;
}

// ==========================================
// MÓDULO DOUTRINA PENDENTE (DESCOBERTAS WEB)
// ==========================================

export async function carregarDoutrinaPendente(): Promise<ReferenciaDoutrinaria[]> {
  try {
    const db = getAppFirestore();
    const snapshot = await getDocs(collection(db, 'doutrina_pendente_vd'));
    if (!snapshot.empty) {
      const list: ReferenciaDoutrinaria[] = [];
      snapshot.forEach(docSnap => {
        list.push(docSnap.data() as ReferenciaDoutrinaria);
      });
      localStorage.setItem(LOCAL_STORAGE_DOUTRINA_PENDENTE_KEY, JSON.stringify(list));
      return list;
    }
  } catch (err) {
    console.warn('Firestore doutrina_pendente indisponível, usando cache:', err);
  }

  const local = localStorage.getItem(LOCAL_STORAGE_DOUTRINA_PENDENTE_KEY);
  if (local) {
    try {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }

  return [];
}

export async function salvarDoutrinaPendente(itens: ReferenciaDoutrinaria[]): Promise<boolean> {
  try {
    const db = getAppFirestore();
    for (const item of itens) {
      await setDoc(doc(db, 'doutrina_pendente_vd', item.id), item, { merge: true });
    }
  } catch (err) {
    console.warn('Erro ao salvar doutrina pendente no Firestore:', err);
  }

  try {
    localStorage.setItem(LOCAL_STORAGE_DOUTRINA_PENDENTE_KEY, JSON.stringify(itens));
  } catch (err) {
    console.error('Erro ao gravar cache de doutrina pendente:', err);
  }
  return true;
}

export async function aprovarDoutrinaItem(item: ReferenciaDoutrinaria): Promise<boolean> {
  const itemAprovado: ReferenciaDoutrinaria = {
    ...item,
    statusValidacao: 'validado',
    dataRegisto: new Date().toISOString()
  };

  // Salvar no repositório ativo
  await salvarReferenciaDoutrinaria(itemAprovado);

  // Remover ou atualizar na coleção pendente
  try {
    const db = getAppFirestore();
    await deleteDoc(doc(db, 'doutrina_pendente_vd', item.id));
  } catch {}

  try {
    const local: ReferenciaDoutrinaria[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_DOUTRINA_PENDENTE_KEY) || '[]');
    const updated = local.filter(d => d.id !== item.id);
    localStorage.setItem(LOCAL_STORAGE_DOUTRINA_PENDENTE_KEY, JSON.stringify(updated));
  } catch {}

  return true;
}

export async function aprovarTodasDoutrinas(itens: ReferenciaDoutrinaria[]): Promise<ReferenciaDoutrinaria[]> {
  const dataHoje = new Date().toISOString().split('T')[0];
  const itensAprovados: ReferenciaDoutrinaria[] = itens.map(item => ({
    ...item,
    statusValidacao: 'validado',
    dataRegisto: item.dataRegisto || dataHoje
  }));

  // Salvar no repositório ativo no Firestore
  try {
    const db = getAppFirestore();
    for (const item of itensAprovados) {
      await setDoc(doc(db, 'doutrina_vd', item.id), item, { merge: true });
    }
  } catch (err) {
    console.warn('Erro ao salvar lote de doutrina no Firestore:', err);
  }

  // Atualizar cache local da doutrina ativa
  try {
    const local: ReferenciaDoutrinaria[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_DOUTRINA_KEY) || '[]');
    const mapa = new Map<string, ReferenciaDoutrinaria>();
    for (const d of local) mapa.set(d.id, d);
    for (const d of itensAprovados) mapa.set(d.id, d);
    const combinada = Array.from(mapa.values());
    combinada.sort((a, b) => Number(b.anoEdicao || 0) - Number(a.anoEdicao || 0));
    localStorage.setItem(LOCAL_STORAGE_DOUTRINA_KEY, JSON.stringify(combinada));
  } catch (err) {
    console.error('Erro ao atualizar cache local de doutrina:', err);
  }

  // Remover todos da coleção pendente no Firestore
  try {
    const db = getAppFirestore();
    for (const item of itens) {
      await deleteDoc(doc(db, 'doutrina_pendente_vd', item.id)).catch(() => {});
    }
  } catch (err) {
    console.warn('Erro ao limpar pendentes no Firestore:', err);
  }

  // Limpar cache local de pendentes
  try {
    localStorage.setItem(LOCAL_STORAGE_DOUTRINA_PENDENTE_KEY, JSON.stringify([]));
  } catch {}

  return itensAprovados;
}

export async function rejeitarDoutrinaItem(id: string): Promise<boolean> {
  try {
    const db = getAppFirestore();
    await deleteDoc(doc(db, 'doutrina_pendente_vd', id));
  } catch {}

  try {
    const local: ReferenciaDoutrinaria[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_DOUTRINA_PENDENTE_KEY) || '[]');
    const updated = local.filter(d => d.id !== id);
    localStorage.setItem(LOCAL_STORAGE_DOUTRINA_PENDENTE_KEY, JSON.stringify(updated));
  } catch {}

  return true;
}

// ==========================================
// MÓDULO JURISPRUDÊNCIA: CARREGAR & SINCRONIZAR
// ==========================================

export async function limparModuloJurisprudencia(): Promise<boolean> {
  try {
    const db = getAppFirestore();
    const snapshot = await getDocs(collection(db, 'jurisprudencia_vd'));
    for (const docSnap of snapshot.docs) {
      await deleteDoc(doc(db, 'jurisprudencia_vd', docSnap.id)).catch(() => {});
    }
  } catch (err) {
    console.warn('Erro ao limpar coleção de jurisprudência no Firestore:', err);
  }

  try {
    localStorage.removeItem(LOCAL_STORAGE_JURIS_KEY);
    localStorage.setItem(LOCAL_STORAGE_CLEARED_JURIS_KEY, 'true');
  } catch {}
  return true;
}

export async function carregarJurisprudencia(): Promise<AcordaoJurisprudencia[]> {
  // Se o utilizador limpou o módulo explicitamente, mantém vazio
  if (localStorage.getItem(LOCAL_STORAGE_CLEARED_JURIS_KEY) === 'true') {
    return [];
  }

  try {
    const db = getAppFirestore();
    const snapshot = await getDocs(collection(db, 'jurisprudencia_vd'));
    if (!snapshot.empty) {
      const list: AcordaoJurisprudencia[] = [];
      snapshot.forEach(docSnap => {
        list.push(docSnap.data() as AcordaoJurisprudencia);
      });
      localStorage.setItem(LOCAL_STORAGE_JURIS_KEY, JSON.stringify(list));
      return list;
    } else {
      localStorage.setItem(LOCAL_STORAGE_JURIS_KEY, JSON.stringify([]));
      return [];
    }
  } catch (err) {
    console.warn('Firestore jurisprudencia indisponível, usando cache/padrão:', err);
  }

  const local = localStorage.getItem(LOCAL_STORAGE_JURIS_KEY);
  if (local) {
    try {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }

  return [];
}

export async function salvarAcordaoJurisprudencia(acordao: AcordaoJurisprudencia): Promise<boolean> {
  try {
    const db = getAppFirestore();
    await setDoc(doc(db, 'jurisprudencia_vd', acordao.id), acordao, { merge: true });
    localStorage.removeItem(LOCAL_STORAGE_CLEARED_JURIS_KEY);
  } catch (err) {
    console.warn('Erro ao salvar acórdão no Firestore:', err);
  }

  try {
    const local: AcordaoJurisprudencia[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_JURIS_KEY) || '[]');
    const idx = local.findIndex(a => a.id === acordao.id);
    if (idx >= 0) local[idx] = acordao;
    else local.unshift(acordao);
    localStorage.setItem(LOCAL_STORAGE_JURIS_KEY, JSON.stringify(local));
  } catch (err) {
    console.error('Erro ao salvar acórdão localmente:', err);
  }
  return true;
}

export async function eliminarAcordaoJurisprudencia(id: string): Promise<boolean> {
  try {
    const db = getAppFirestore();
    await deleteDoc(doc(db, 'jurisprudencia_vd', id));
  } catch (err) {
    console.warn('Erro ao eliminar acórdão no Firestore:', err);
  }

  try {
    const local: AcordaoJurisprudencia[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_JURIS_KEY) || '[]');
    const updated = local.filter(a => a.id !== id);
    localStorage.setItem(LOCAL_STORAGE_JURIS_KEY, JSON.stringify(updated));
  } catch {}
  return true;
}

export async function verificarEInicializarBancoDeDados(): Promise<void> {
  try {
    const db = getAppFirestore();
    const statusRef = doc(db, 'system_metadata', 'status');
    const statusSnap = await getDoc(statusRef);
    
    // Check if doutrina is empty and needs populating (independent of initial statusRef to avoid empty states on update)
    try {
      const doutrinaSnap = await getDocs(collection(db, 'doutrina_vd'));
      if (doutrinaSnap.empty && localStorage.getItem(LOCAL_STORAGE_CLEARED_DOUTRINA_KEY) !== 'true') {
        console.log('A popular coleção de doutrina vazia...');
        for (const d of DOUTRINA_INICIAL) {
          await setDoc(doc(db, 'doutrina_vd', d.id), d, { merge: true }).catch(() => {});
        }
      }
    } catch (err) {
      console.warn('Erro ao verificar/popular doutrina no Firestore:', err);
    }

    // Forçar atualização da legislação para a nova lista de 33 itens do utilizador
    const legisStatusRef = doc(db, 'system_metadata', 'legislation_v4');
    const legisStatusSnap = await getDoc(legisStatusRef);
    if (!legisStatusSnap.exists()) {
      console.log('A forçar atualização para as novas 33 leis de referência...');
      try {
        // 1. Apagar todas as leis antigas do Firestore
        const legisSnap = await getDocs(collection(db, 'legislacao_vd'));
        for (const docSnap of legisSnap.docs) {
          await deleteDoc(doc(db, 'legislacao_vd', docSnap.id)).catch(() => {});
        }
        
        // 2. Apagar leis pendentes antigas
        const pendSnap = await getDocs(collection(db, 'legislacao_pendente_vd'));
        for (const docSnap of pendSnap.docs) {
          await deleteDoc(doc(db, 'legislacao_pendente_vd', docSnap.id)).catch(() => {});
        }
        
        // 3. Escrever as 33 novas leis no Firestore
        for (const d of LEGISLACAO_INICIAL) {
          await setDoc(doc(db, 'legislacao_vd', d.id), d, { merge: true }).catch(() => {});
        }
        
        // 4. Limpar caches locais de legislação
        localStorage.removeItem(LOCAL_STORAGE_LEGIS_KEY);
        localStorage.removeItem(LOCAL_STORAGE_LEGIS_PENDENTE_KEY);
        localStorage.removeItem(LOCAL_STORAGE_CLEARED_LEGIS_KEY);
        
        // 5. Marcar como atualizado
        await setDoc(legisStatusRef, { updated: true, updatedAt: new Date().toISOString() }).catch(() => {});
      } catch (err) {
        console.warn('Erro ao forçar atualização de legislação:', err);
      }
    }
    
    if (statusSnap.exists() && statusSnap.data()?.initialized === true) {
      return;
    }
    
    console.log('A inicializar base de dados com registos padrão...');
    
    // 1. Popular Legislação
    for (const d of LEGISLACAO_INICIAL) {
      await setDoc(doc(db, 'legislacao_vd', d.id), d, { merge: true }).catch(() => {});
    }
    
    // 2. Popular Jurisprudência
    for (const j of JURISPRUDENCIA_INICIAL) {
      await setDoc(doc(db, 'jurisprudencia_vd', j.id), j, { merge: true }).catch(() => {});
    }
    
    // 3. Popular Contactos
    for (const c of CONTACTOS_INICIAIS) {
      await setDoc(doc(db, 'contactos_uteis_vd', c.id), c, { merge: true }).catch(() => {});
    }
    
    // Marcar como inicializado no Firestore
    await setDoc(statusRef, { initialized: true, updatedAt: new Date().toISOString() });
    
  } catch (err) {
    console.warn('Erro ao verificar/inicializar base de dados no Firestore:', err);
  }
}



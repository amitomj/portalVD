import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure pdfjs worker
// Use unpkg/cdnjs worker matching pdfjs-dist version, with local fallback
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
} catch (e) {
  console.warn('Configuração de worker pdfjs:', e);
}

export interface ExtractedDocument {
  fileName: string;
  fileType: 'pdf' | 'docx' | 'txt';
  fileSize: number;
  text: string;
  pageCount?: number;
}

/**
 * Lê e extrai texto puro de ficheiros PDF, DOCX ou TXT inteiramente no navegador.
 * NENHUM dado é enviado para a web ou servidores externos.
 */
export async function extrairTextoDeFicheiro(file: File): Promise<ExtractedDocument> {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';

  if (extension === 'pdf') {
    return await lerFicheiroPDF(file);
  } else if (extension === 'docx' || extension === 'doc') {
    return await lerFicheiroWord(file);
  } else if (extension === 'txt') {
    return await lerFicheiroTxt(file);
  } else {
    throw new Error(`Formato de ficheiro .${extension} não suportado. Por favor use .pdf, .docx ou .txt`);
  }
}

async function lerFicheiroTxt(file: File): Promise<ExtractedDocument> {
  const text = await file.text();
  return {
    fileName: file.name,
    fileType: 'txt',
    fileSize: file.size,
    text: text.trim(),
    pageCount: 1
  };
}

async function lerFicheiroWord(file: File): Promise<ExtractedDocument> {
  const arrayBuffer = await file.arrayBuffer();
  try {
    const result = await mammoth.extractRawText({ arrayBuffer });
    return {
      fileName: file.name,
      fileType: 'docx',
      fileSize: file.size,
      text: result.value.trim(),
      pageCount: Math.max(1, Math.ceil(result.value.length / 2500))
    };
  } catch (err: any) {
    throw new Error(`Erro ao ler documento Word (${file.name}): ${err?.message || 'Ficheiro corrompido ou formato incompatível'}`);
  }
}

async function lerFicheiroPDF(file: File): Promise<ExtractedDocument> {
  const arrayBuffer = await file.arrayBuffer();
  try {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
    });
    
    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;
    const fullTextParts: string[] = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      let lastY: number | null = null;
      let pageText = '';
      
      for (const item of textContent.items as any[]) {
        if ('str' in item) {
          if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
            pageText += '\n' + item.str;
          } else {
            pageText += (pageText.endsWith(' ') || item.str.startsWith(' ') ? '' : ' ') + item.str;
          }
          lastY = item.transform[5];
        }
      }
      fullTextParts.push(pageText.trim());
    }

    return {
      fileName: file.name,
      fileType: 'pdf',
      fileSize: file.size,
      text: fullTextParts.join('\n\n--- PÁGINA ---\n\n').trim(),
      pageCount: numPages
    };
  } catch (err: any) {
    throw new Error(`Erro ao processar ficheiro PDF (${file.name}): ${err?.message || 'Ficheiro protegido ou corrompido'}`);
  }
}

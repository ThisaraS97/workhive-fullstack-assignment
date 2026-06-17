declare module 'pdf-parse' {
  interface PDFData {
    text: string;
    numpages: number;
  }

  function pdfParse(data: Buffer): Promise<PDFData>;
  export default pdfParse;
}

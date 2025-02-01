import { ReactElement, useState, ChangeEvent } from 'react'

import { pdfjs, Document, Page } from 'react-pdf'
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
import 'react-pdf/dist/Page/TextLayer.css';

import { Correspondance } from './Correspondances.tsx'
import Correspondances from './Correspondances.tsx'

import './App.css'

function RixButton({ row, selectCorrespondance } : { row:Correspondance, selectCorrespondance: (id: Correspondance) => void }) {
  return (
    <div>
      <button
        className="rixbutton"
        onClick={() => selectCorrespondance(row)}>
        {row.st}
      </button>
    </div>
  );
}

function RixTable( {filterText, selectCorrespondance}: { filterText:string, selectCorrespondance: (id: Correspondance) => void } ) {
  const buttons: ReactElement[] = [];

  Correspondances.forEach((row) => {
    if (row.st.toLowerCase().indexOf(filterText.toLowerCase()) == -1) {
      return;
    }

    buttons.push(
      <RixButton
        row={row}
        selectCorrespondance={selectCorrespondance}
        key={row.st}/>
    );
  });

  return (
    <div className="rixtable">
      {buttons}
    </div>
  );
}

function RixSearch( {filterText, onFilterTextChange} : { filterText:string, onFilterTextChange: (id: string) => void} ) {
  return (
    <div>
        <input className="rixsearch"
          id="rixsearch"
          type="text"
          value={filterText} placeholder='Search by ST Index'
          onChange={(e) => onFilterTextChange(e.target.value)}
        />
    </div>
  );
}

function RixBar( {setPageNumber} : { setPageNumber: (id: PageNumber) => void } ) {
  const [selectedCorrespondance, selectCorrespondance] = useState<Correspondance>({st: "", ii: "", page: 0});
  const [filterText, setFilterText] = useState("");

  return (
    <div className="rixbar">
      <RixSearch
        filterText={filterText}
        onFilterTextChange={setFilterText}/>
      <RixTable
        filterText={filterText}
        selectCorrespondance={(id:Correspondance) => {
          selectCorrespondance(id);
          if (!isNaN(id.page) && id.page > 0 && id.page <= 1523 /* book length */)
            setPageNumber({bookNumber: id.page});
          }}/>
      <div className="correspondance">
        <div>‎ Rix Index ‎</div>
        <div>{selectedCorrespondance.st}</div>

        <div>‎ II Index</div>
        <div className='ii'>{selectedCorrespondance.ii}</div>

        <div>‎ Volume</div>
        <div>{selectedCorrespondance.page >= 1 ? (
              selectedCorrespondance.page <= 611 ? "I" :
              selectedCorrespondance.page <= 1306 ? "II" : "III") : "‎"}</div>

        <div>‎ Page #</div>
        <div>{selectedCorrespondance.page >= 1 ? selectedCorrespondance.page : ""}</div>
      </div>
    </div>
  );
}

function PdfViewer ({pdfFile, pageNumber, setPageNumber} : 
  {pdfFile: File, pageNumber: number, setPageNumber: (id: number) => void}) {
    if (0) { // given up react-pdf path. faster, but bad resolution and hard to wrap in css
      return (
        <div className="pdfviewer">
          <div>
            <button onClick={() => {setPageNumber(pageNumber - 1)}}>
              Previous
            </button>
            {pageNumber}
            <button onClick={() => {setPageNumber(pageNumber + 1)}}>
              Next
            </button>
          </div>
          <Document file={pdfFile} onLoadError={console.error} className={"pdfcanvas"}>
            <Page
              pageNumber={pageNumber}
              renderAnnotationLayer={false}
              height={document.documentElement.clientHeight * 0.70}/>
          </Document>
        </div>
      );
    }
    return (
      <object
        className='pdfviewer'
        data={URL.createObjectURL(pdfFile) + "#page=" + pageNumber.toString()}
        type="application/pdf" width="100%" height="100%"></object>
    );
}

interface BookNumber{bookNumber: number, pdfNumber?: never};
interface PdfNumber{pdfNumber: number, bookNumber?: never};
type PageNumber = BookNumber | PdfNumber;

function PdfHelper( {pageNumber, setPdfNumber} : {pageNumber: PageNumber, setPdfNumber: (id: number) => void} ) {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [controls, setControls] = useState(true);
  const [offsetOne, setOffsetOne] = useState(0);
  const [offsetTwo, setOffsetTwo] = useState(0);
  const [offsetThree, setOffsetThree] = useState(0);
  const [doubled, setDoubled] = useState(true);

  const updateFile = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setPdfFile(file);
    }
  }

  /* convert book page to pdf page number */

  let pdfpage;
  if (pageNumber.pdfNumber != null) {
    pdfpage = pageNumber.pdfNumber;
  } else {
    if (pageNumber.bookNumber <= 611) { // Volume 1
      pdfpage = Math.round((pageNumber.bookNumber + 23) / (doubled ? 2 : 1)) + offsetOne;
    } else if (pageNumber.bookNumber <= 1306) { // Volume 2
      pdfpage = Math.round((pageNumber.bookNumber + 31) / (doubled ? 2 : 1)) + offsetTwo;
    } else { // Volume 3
      pdfpage = Math.round((pageNumber.bookNumber + 41) / (doubled ? 2 : 1)) + offsetThree;
    }
  }
    

  return (
    <div className="pdfhelper">
      {pdfFile && !controls ? (
        <PdfViewer
          pdfFile={pdfFile}
          pageNumber={pdfpage}
          setPageNumber={setPdfNumber}
        />
      ) : (
        <div className="controls">
          <h1>Imagines Italicae: Rix Index Lookup</h1>
          <h4>Upload a scan of your Imagines Italicae copy, and set the offset values to correct any deviations in page number</h4>
          <input
            type="file"
            accept="application/pdf"
            onChange={updateFile}
          />
          <br/>
          Volume I offset: <input id="vol1in" type="number" value={offsetOne} onChange={(e) => setOffsetOne(e.target.valueAsNumber)}/><br/>
          Volume II offset: <input id="vol2in" type="number" value={offsetTwo} onChange={(e) => setOffsetTwo(e.target.valueAsNumber)}/><br/>
          Volume III offset: <input id="vol3in" type="number" value={offsetThree} onChange={(e) => setOffsetThree(e.target.valueAsNumber)}/><br/>
          Double Paged: <input id="doubled" type="checkbox" checked={doubled} onChange={(e) => setDoubled(e.target.checked)}/><br/>
          {pdfFile ? (
            <button onClick={() => {setControls(false)}}>
              Go
            </button>
          ) : <></>}
        </div>
      )}
    </div>
  );
}

function App() {
  const [pageNumber, setPageNumber] = useState<PageNumber>({pdfNumber: 1});

  return (
    <div className="app">
      <RixBar setPageNumber={setPageNumber}/>
      <div className="mainview">
        <PdfHelper
          pageNumber={pageNumber}
          setPdfNumber={(id:number) => {setPageNumber({pdfNumber: id})}}/>
      </div>
    </div>
  );
}

export default App

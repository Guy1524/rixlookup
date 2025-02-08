import { ReactElement, useState, ChangeEvent } from 'react'

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

function PdfViewer ({pdfFile, pageNumber} : 
  {pdfFile: File, pageNumber: number}) {

    return (
      //<object
        //className='pdfviewer'
        //data={URL.createObjectURL(pdfFile) + "#page=" + pageNumber.toString()}
        //type="application/pdf" width="100%" height="100%"></object>
      <iframe
        className='pdfviewer'
        src={import.meta.env.BASE_URL + "/pdfjs-dist/web/viewer.html?file=" + URL.createObjectURL(pdfFile) + "#page=" + pageNumber.toString()}/>
    );
}

interface BookNumber{bookNumber: number, pdfNumber?: never};
interface PdfNumber{pdfNumber: number, bookNumber?: never};
type PageNumber = BookNumber | PdfNumber;

function PdfHelper( {pageNumber} : {pageNumber: PageNumber} ) {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [landpage, setLandPage] = useState(true);
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
      {pdfFile && !landpage ? (
        <PdfViewer
          pdfFile={pdfFile}
          pageNumber={pdfpage}
        />
      ) : (
        <div className="landpage">
          <h1>Imagines Italicae: Rix Index Lookup</h1>
          <div className="instructions">
            <h4>Instructions</h4>
            <ol>
              <li>Are you using Rix’s Sabellische Texte, and want to look up an inscription in Imagines Italicae?
                Just type the Rix designation (e.g., Um 11) in the top left corner of this page and a list of
                inscriptions matching your search will appear below (in grey).</li>
              <li>Click on the inscription that you want, and the box at the bottom left of the page will show
                you the Imagines Italicae designation (for Um 11, it’s Asisium 4), along with the volume and page
                number (Volume 1, page 107).</li>
              <li>If you own your own pdf of Imagines Italicae (in a single file), you can upload it to this
                interface by clicking on the ’Select file’ button below, and when you select an inscription from
                the left menu, the correct page will load in this space.</li>
              <li>If the PDF viewer takes you to page that's off from the intended inscription, you can alleviate
                this by setting the offset fields:<br/>For example, if you consistently see the page 2 pages
                ahead of the selected inscription, try setting the offset field for the relevant volume to '2'.
                <br/>Conversely, use a negative offset if you are led to a position ahead of the selected inscription.
              </li>
            </ol>

            <h4>Credits</h4>
            This online tool was created during the Wintersemester 2024–2025 by Derek Lesho and Fujia Zhang,
            as part of the graduate seminar Italische Sprachwissenschaft, taught by Chiara Bozzone (LMU München).
            If you do not already know why this tool is needed, you can read about it <a href="https://bmcr.brynmawr.edu/2013/2013.06.17/">here</a>
            <br/><br/>
            For help and feeback contact <a href="mailto:D.Lesho@campus.lmu.de">D.Lesho@campus.lmu.de</a> or <a href="mailto:dereklesho52@gmail.com">dereklesho52@gmail.com</a>
          </div>
          
          <div className="controls">
          <h4>Imagines Italicae copy upload</h4>
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
              <button onClick={() => {setLandPage(false)}}>
                Go
              </button>
            ) : <></>}
          </div>
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
          pageNumber={pageNumber}/>
      </div>
    </div>
  );
}

export default App

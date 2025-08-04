import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import axios from 'axios'

function App() {

  const [selectedCaseType, setSelectedCaseType] = useState("")

  const [selectedCaseNumber, setSelectedCaseNumber] = useState("")

  const [selectedCaseYear, setSelectedCaseYear] = useState(Number(new Date().getFullYear()))

  const [caseTypes, setCaseTypes] = useState([])

  const [caseData, setCaseData] = useState([])

  const [nothingFound, setNothingFound] = useState(null)

  let backendUrl = "http://localhost:3001"


  const handleCaseTypeChange = (event) => {
    const caseType = event.target.value
    setSelectedCaseType(caseType)
  }

  const handleCaseNumberChange = (event) => {
    const caseNumber = event.target.value
    setSelectedCaseNumber(caseNumber)
  }

  const handleCaseYearChange = (event) => {
    const caseYear = event.target.value
    setSelectedCaseYear(caseYear)
  }

  const handleSubmit = async () => {
    try {
      setNothingFound(false)
      const response = await axios.post(backendUrl + "/get_data", { caseType: selectedCaseType, caseNumber: selectedCaseNumber, caseYear: selectedCaseYear })
      console.log(response)
      const data = response.data

      if(data === "Nothing")
      {
        setNothingFound(true)
        return
      }
      setCaseData(data)
    }
    catch(err)
    {
      console.error(err)
    }
  }

  useEffect(() => {
    async function fetchCaseTypes()
    {
      try
      {
        const response = await axios.get(backendUrl + "/fetch_case_types")

        const caseTypes = await response.data.caseTypes

        setCaseTypes(caseTypes)  
      }
      catch(err)
      {
        console.error(err)
      }
    }

    fetchCaseTypes()
  }, [])

  return (
   <>
    <div id="main_container" className="container mx-auto text-center w-full h-screen">
      <div id="bg" className="container mx-auto text-center w-full bg-slate-100">
        <h1 className="text-3xl mx-auto p-10">
          Case Dashboard
        </h1>
        <div className="mx-auto text-center w-full bg-slate-200 flex flex-col gap-4 justify-around items-center">
          <div className="mx-auto p-4 text-center flex justify-center">
            <div className="mx-auto p-2 text-center text-lg md:text-xl">
              Case Type:
            </div>
            <select value={ selectedCaseType } className="mx-auto px-3 py-2 w-[25vw] md:w-[15vw] text-center outline-none border-2 border-slate-300 rounded-md text-lg"
            onChange={ handleCaseTypeChange }>
              <option>
                Select
              </option>

              {
                caseTypes.map((caseType, index) => 
                  <option>
                    { caseType }
                  </option>
                )
              }
            </select>
          </div>

          <div className="mx-auto p-4 text-center flex justify-center">
            <div className="mx-auto text-center px-3 py-2 text-lg md:text-xl">
              Case Number:
            </div>
            <input type="number" id="caseNumber" value={ selectedCaseNumber } className="mx-auto px-3 py-2 text-center rounded-md outline-none border-2 border-slate-300"
            onChange={ handleCaseNumberChange }></input>
          </div>
          <div className="mx-auto p-4 text-center flex justify-center">
            <div className="mx-auto text-center px-3 py-2 text-lg md:text-xl">
              Filing Year:
            </div>
            <input type="number" id="caseYear" value={ selectedCaseYear } max={ Number(new Date().getFullYear())}
            className="mx-auto text-center rounded-md outline-none border-2 border-slate-300"
            min={ 1900 } onChange={ handleCaseYearChange }></input>
          </div>

          <button className="mx-auto text-center bg-blue-500 text-white rounded-md px-3 py-2" onClick={ handleSubmit }>
            Submit
          </button>
        </div>

        
        <div className="w-[99vw] text-xs md:text-md lg:text-lg mx-auto">
          { caseData.length > 0 ? 
            (<table className="w-[100%] mx-auto">
              <thead>
                <tr>
                <td className="border-2 border-slate-300">
                  Petitioner Name
                </td>
                <td className="border-2 border-slate-300">
                  Respondent Name
                </td>
                <td className="border-2 border-slate-300">
                  Advocate Name
                </td>
                <td className="border-2 border-slate-300">
                  Status
                </td>
                <td className="border-2 border-slate-300">
                  Next Date
                </td>
                </tr>
              </thead>
              <tbody>
              {
                caseData.map((a, index) =>
              <tr className="border-2 border-slate-300">
                <td className="border-2 border-slate-300">
                  { a.petitionerName }
                </td>
                <td className="border-2 border-slate-300">
                  { a.respondentName}
                </td>
                <td className="border-2 border-slate-300">
                  { a.advocateName }
                </td>
                <td className="border-2 border-slate-300">
                  { a.status}
                </td>
                <td className="border-2 border-slate-300">
                  { a.nextDate }
                </td>
              </tr>
              )
              }
            </tbody>
            </table>
            )
            :
          
          nothingFound &&
          
          (
          <div className="mx-auto text-center text-xl">
          No cases found.
          </div>
          ) 
          
          }
        </div>
        
      </div>
    </div>
   </>
  )
}

export default App

const express = require('express');
const { chromium } = require('playwright');
const app = express()
const cors = require('cors')
const port = 3001
const { Pool } = require('pg')
require('dotenv').config()

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}
))

app.use(express.json())


const dbName = process.env.DATABASE_NAME
const dbPassword = process.env.DB_PASSWORD

let browser;

const pool = new Pool({
  user: 'nssha',
  host: 'localhost',
  database: dbName,
  password: dbPassword,
  port: 5432,
})


app.get('/fetch_case_types', async (req, res) => {
    
    const browser = await chromium.launch({ headless: false })
    const context = await browser.newContext()
    const page = await context.newPage()
    await page.goto("https://www.phhc.gov.in/home.php?search_param=case")

    const caseTypeSelectBox = await page.locator("(//select[@name = 't_case_type'])[1]")

    await caseTypeSelectBox.click()

    const caseTypeLocators = (await caseTypeSelectBox.locator("option").all()).slice(1, )

    const caseTypes = await Promise.all(caseTypeLocators.map(async (e) => {
                return await e.innerText()
                })
            )
    
    await browser.close()

    await res.json({ caseTypes })


})    

app.post("/get_data", async (req, res) => {

    try
    {
      const reqBody = await req.body
      console.log(reqBody)
      const { caseType, caseNumber, caseYear } = reqBody

      await logQuery(reqBody)
      
      browser = await chromium.launch({ headless: false })
      const context = await browser.newContext()
      const page = await context.newPage()
      await page.goto("https://www.phhc.gov.in/home.php?search_param=case")

      const caseTypeSelectBox = await page.locator("(//select[@name = 't_case_type'])[1]")

      await caseTypeSelectBox.click()

      await caseTypeSelectBox.selectOption({ label: caseType })

      const caseNumberBox = await page.locator("(//input[@name = 't_case_no'])[1]")

      await caseNumberBox.fill(caseNumber)

      const caseYearBox = await page.locator("(//select[@name = 't_case_year'])[1]")

      await caseYearBox.click()

      await caseYearBox.selectOption({ label: caseYear.toString() })

      const submitButton = await page.locator("(//input[@value = 'Search Case'])[1]")

      await submitButton.click()

      await page.waitForSelector("(//table[@id = 'tables11'])[1]//tr[@class = 'alt']", { timeout: 5000 })
      

      
      
      const allTableRows = await page.locator("(//table[@id = 'tables11'])[1]//tr[@class = 'alt']").all()

      const tableRows = allTableRows.slice(0, 10)
      let caseData = []

      for(let i = 0; i < tableRows.length; i++) 
        {
          const petitionerName = await tableRows[i].locator("td:nth-child(2)").innerText()
          const respondentName = await tableRows[i].locator("td:nth-child(3)").innerText()
          const advocateName = await tableRows[i].locator("td:nth-child(4)").innerText()
          const status = await tableRows[i].locator("td:nth-child(5)").innerText()
          const nextDate = await tableRows[i].locator("td:nth-child(6)").innerText()

          const arrayItem = {petitionerName: petitionerName, respondentName: respondentName, advocateName: advocateName, status: status, nextDate: nextDate}

          caseData.push(arrayItem)
        }

      console.log(caseData)
      
      
      await logResponse(caseData)

      await res.json(caseData)

      await browser.close()
    }

    catch(err)
    {
      console.error(err)
      await res.json("Nothing")
      await browser.close()
    }

      

      

      



    
})
    

const logQuery = async (reqBody) => {
  const { caseType, caseNumber, caseYear } = reqBody

  const result = await pool.query("INSERT INTO queries (case_type, case_number, case_year) VALUES($1, $2, $3)", [caseType, caseNumber, caseYear])

  console.log(result.rows)
   
   
}

const logResponse = async (caseData) => {
  const result = await pool.query("INSERT INTO responses (response_data) VALUES ($1)", [JSON.stringify(caseData)])
  console.log(result.rows)

}


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
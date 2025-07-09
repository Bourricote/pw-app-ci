import {test, expect} from '@playwright/test'

test.beforeEach(async({page}) => {
    await page.goto('http://localhost:4200/') 
})

test.describe('Form layouts page', () => {
    test.beforeEach(async({page}) => {
        await page.getByText('Forms').click()
        await page.getByText('Form Layouts').click()
    })

    test('input fields', async({page}) => {
        const usingTheGridEmailInput = page.locator('nb-card', {hasText: "Using the Grid"}).getByRole('textbox', {name: "Email"})
        await usingTheGridEmailInput.fill('test@test.com')
        await usingTheGridEmailInput.clear()
        await usingTheGridEmailInput.pressSequentially('test2@test.com', {delay: 200}) // simuler écriture lente

        //generic assertion
        const inputValue = await usingTheGridEmailInput.inputValue()
        expect(inputValue).toEqual('test2@test.com')

        //locator assertion
        await expect(usingTheGridEmailInput).toHaveValue('test2@test.com')
    })

    test('radio buttons', async({page}) => {
        const usingTheGridForm = page.locator('nb-card', {hasText: "Using the Grid"})
        //await usingTheGridForm.getByLabel('Option 1').check({force: true}) // obligés de forcer car le radio button est "visually-hidden"
        await usingTheGridForm.getByRole('radio', {name: "Option 2"}).check({force: true})

        //generic assertion
        const radioStatus = await usingTheGridForm.getByRole('radio', {name: "Option 1"}).isChecked()

        await expect(usingTheGridForm).toHaveScreenshot({maxDiffPixels: 250})
        // expect(radioStatus).toBeTruthy()

        // //locator
        // await expect(usingTheGridForm.getByRole('radio', {name: "Option 1"})).toBeChecked()

        // await usingTheGridForm.getByRole('radio', {name: "Option 2"}).check({force: true})
        // expect(await usingTheGridForm.getByRole('radio', {name: "Option 1"}).isChecked()).toBeFalsy()
        // expect(await usingTheGridForm.getByRole('radio', {name: "Option 2"}).isChecked()).toBeTruthy()
    })
})

test('checkboxes', async({page}, testInfo) => {
    if(testInfo.retry){
        // do something
    }
    await page.getByText('Modal & Overlays').click()
    await page.getByText('Toastr').click()

    await page.getByRole('checkbox', {name: "Hide on click"}).click({force: true}) // clic que ce soit déjà check ou pas
    await page.getByRole('checkbox', {name: "Prevent arising of duplicate toast"}).check({force: true}) // s'assure que le statut est "checked" donc ne fait rien si déjà checked
    await page.getByRole('checkbox', {name: "Hide on click"}).uncheck({force: true}) // idem mais uncheck

    // act on all checkboxes
    const allCheckboxes = page.getByRole('checkbox')
    for(const box of await allCheckboxes.all()){
        await box.check({force: true}) //on veut check TOUTES les checkboxes
        expect(await box.isChecked()).toBeTruthy()
    }

})

test('lists and dropdowns', async({page}) => {
    const dropDownMenu = page.locator('ngx-header nb-select')
    await dropDownMenu.click()

    page.getByRole('list')  // pour les listes <ul>
    page.getByRole('listitem') // pour les <li>, ici ce n'est pas le cas ce sont des 'nb-option'

    //const optionList = page.getByRole('list').locator('nb-option') //ok mais wordy
    const optionList = page.locator('nb-option-list nb-option')
    await expect(optionList).toHaveText(["Light", "Dark", "Cosmic", "Corporate"])
    await optionList.filter({hasText: "Cosmic"}).click() //select une option

    // check si le background a bien changé
    const header = page.locator('nb-layout-header')
    await expect(header).toHaveCSS('background-color', 'rgb(50, 50, 89)')
})

test('tooltips', async({page}) => {
    await page.getByText('Modal & Overlays').click()
    await page.getByText('Tooltip').click()

    const toolTipCard = page.locator('nb-card', {hasText: "Tooltip Placements"})
    await toolTipCard.getByRole('button', {name: "Top"}).hover()

    page.getByRole('tooltip') // ne marche que si dans le site web le rôle tooltip a été utilisé, ce n'est pas le cas ici

    const tooltip = await page.locator('nb-tootlip').textContent()
    expect(tooltip).toEqual('This is a tooltip')
})

test('dialog boxes', async({page}) => {
    await page.getByText('Tables & Data').click()
    await page.getByText('Smart Table').click()

    page.on('dialog', dialog => { //mise en place d'un listener qui va se déclencher au clic sur la poubelle
        expect(dialog.message()).toEqual('Are you sure you want to delete?')
        dialog.accept()
    })

    await page.getByRole('table').locator('tr', {hasText: "mdo@gmail.com"}).locator('.nb-trash').click()
    await expect(page.locator('table tr').first()).not.toHaveText("mdo@gmail.com")
})

test('web tables', async({page}) => {
    await page.getByText('Tables & Data').click()
    await page.getByText('Smart Table').click()

    //1- Get the row by any text in this row (only if UNIQUE textvalue)
    const targetRow = page.getByRole('row', {name: "twitter@outlook.com"})
    //Ex: edit data
    await targetRow.locator('.nb-edit').click() // après ce clic, le texte devient un input ! on ne peut plus utiliser le targetRow
    await page.locator('input-editor').getByPlaceholder('Age').clear()
    await page.locator('input-editor').getByPlaceholder('Age').fill('35')
    await page.locator('.nb-checkmark').click()

    //2- Get the row based on the value in a specific colunn
    //ici on va naviguer vers la 2è page du tableau
    await page.locator('.ng2-smart-pagination-nav').getByText('2').click()
    //on cherche le row ID 11
    //const targetRowById = page.getByRole('row', {name: '11'}) // avec ça on va trouver aussi un row avec Age = 11 !!!
    const targetRowById = page.getByRole('row', {name: '11'}).filter({has: page.locator('td').nth(1).getByText('11')}) //on cible la 2è colonne : ID
    await targetRowById.locator('.nb-edit').click()
    await page.locator('input-editor').getByPlaceholder('E-mail').clear()
    await page.locator('input-editor').getByPlaceholder('E-mail').fill('tuttut@test.fr')
    await page.locator('.nb-checkmark').click()
    //chec si on a bien changé la valeur
    await expect(targetRowById.locator('td').nth(5)).toHaveText('tuttut@test.fr')

})

test('web tables 2', async({page}) => {
    await page.getByText('Tables & Data').click()
    await page.getByText('Smart Table').click()

    //Test filter of the table
    const ages = ["20", "30", "40", "200"]

    for(let age of ages){
        //fill search filter
        await page.locator('input-filter').getByPlaceholder('Age').clear()
        await page.locator('input-filter').getByPlaceholder('Age').fill(age)
        await page.waitForTimeout(500) // le tableau met un peu de temps à changer donc besoin d'attendre
        //get rows
        const ageRows = page.locator('tbody tr')
        for(let row of await ageRows.all()){ // .all() to create an array from the const
            const cellValue = await row.locator('td').last().textContent()
            if(age == "200"){
                expect(await page.getByRole('table').textContent()).toContain('No data found')
            } else {
                expect(cellValue).toEqual(age)
            }
            
        }

    }
})

test('date picker 1', async({page}) => {
    await page.getByText('Forms').click()
    await page.getByText('Datepicker').click()
    const calendarInput = page.getByPlaceholder('Form Picker')
    await calendarInput.click()

    //await page.locator('[class="day-cell ng-star-inserted"]').getByText('14').click() 
    //attention aux classes pour ne pas prendre le mois précédent ou suivant
    await page.locator('[class="day-cell ng-star-inserted"]').getByText('1', {exact: true}).click() // pour choisir le 1, au lieu de 10/11/12...
    await expect(calendarInput).toHaveValue('Jun 1, 2025')
})

test('date picker 2', async({page}) => {
    await page.getByText('Forms').click()
    await page.getByText('Datepicker').click()
    const calendarInput = page.getByPlaceholder('Form Picker')
    await calendarInput.click()

    //working with dyynamic dates
    let date = new Date()
    date.setDate(date.getDate() + 1)
    const expectedDate = date.getDate().toString()
    const expectedMonthShort = date.toLocaleString('En-US', {month: 'short'})
    const expectedYear = date.getFullYear()
    const dateToAssert = `${expectedMonthShort} ${expectedDate}, ${expectedYear}`

    await page.locator('[class="day-cell ng-star-inserted"]').getByText(expectedDate, {exact: true}).click() 
    await expect(calendarInput).toHaveValue(dateToAssert)
})

test('date picker 2b', async({page}) => {
    await page.getByText('Forms').click()
    await page.getByText('Datepicker').click()
    const calendarInput = page.getByPlaceholder('Form Picker')
    await calendarInput.click()

    //if the date is not in the current month
    //check which month/year is selected
    let date = new Date()
    date.setDate(date.getDate() + 30)
    const expectedDate = date.getDate().toString()
    const expectedMonthLong = date.toLocaleString('En-US', {month: 'long'})
    const expectedMonthShort = date.toLocaleString('En-US', {month: 'short'})
    const expectedYear = date.getFullYear()
    const dateToAssert = `${expectedMonthShort} ${expectedDate}, ${expectedYear}`
    const expectedMonthAndYear = `${expectedMonthLong} ${expectedYear}`

    let calendarMonthAndYear = await page.locator('nb-calendar-view-mode').textContent()

    while(!calendarMonthAndYear.includes(expectedMonthAndYear)){
        await page.locator('nb-calendar-pageable-navigation [data-name="chevron-right"]').click()
        calendarMonthAndYear = await page.locator('nb-calendar-view-mode').textContent()
    }

    await page.locator('[class="day-cell ng-star-inserted"]').getByText(expectedDate, {exact: true}).click() 
    await expect(calendarInput).toHaveValue(dateToAssert)

})

test('sliders', async({page}) => {
    //update attribute
    //Quand on a les coordonnées qu'on souhaite pour le curseur
    const tempGauge = page.locator('[tabtitle="Temperature"] ngx-temperature-dragger circle')
    await tempGauge.evaluate( node => {
        node.setAttribute('cx', '232.630')
        node.setAttribute('cy', '232.630')
    }) // ça change la position du cercle, mais il faut que le navigateur réagisse
    await tempGauge.click()
})

test('sliders2', async({page}) => {
    //simulate mouse mouvement
    const tempBox = page.locator('[tabtitle="Temperature"] ngx-temperature-dragger')
    await tempBox.scrollIntoViewIfNeeded() // besoin de scroll un peu pour que toute la box soit à l'écran

    const boundingBox = await tempBox.boundingBox()

    const x = boundingBox.x + boundingBox.width /2 //pour se positionner au centre de la bounding box
    const y = boundingBox.x + boundingBox.height /2

    await page.mouse.move(x, y) //position de départ
    await page.mouse.down() //simuler clic gauche maintenu
    await page.mouse.move(x+100, y) //horizontal vers la droite
    await page.mouse.move(x+100, y+200) //vertical vers le bas
    await page.mouse.up() // relâcher clic gauche

    await expect(tempBox).toContainText('30')
})

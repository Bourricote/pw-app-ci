import {test, expect} from '@playwright/test'

test.beforeEach(async ({page}) => {
    await page.goto('http://localhost:4200/') 
    await page.getByText('Forms').click()
    await page.getByText('Form Layouts').click()
    
})

    
test('locator', async ({page}) => {  
    // by tag name
    page.locator('input') // returns all inputs on the page

    // by id
    await page.locator('#inputEmail').click()

    // by class
    page.locator('.shae-rectangle')

    // by attribute
    page.locator('[placeholder="Email"]')

    // by entire class value
    page.locator('[class="inpu-full-width size-medium shape-rectangle')

    // combine different selectors
    page.locator('input[placeholder="Email"]')

    // by Xpath NOT RECOMMENDED
    page.locator('//*[@id="inputEmail"]')

    // by partial text match
    page.locator(':text("Using")')

    // by exact text match
    page.locator(':text-is("Using the Grid")')
})

test('user-facing locators', async ({page}) => {  
    await page.getByRole('textbox', {name: "Email"}).first().click()
    await page.getByRole('button', {name: "Sign in"}).first().click()

    await page.getByLabel('Email').first().click()

    await page.getByPlaceholder('Jane Doe').click()

    await page.getByText('Using the Grid').click()
    await page.getByTitle('IoT Dashboard').click()
    await page.getByTestId('IoT Dashboard').click() // Test ID ajouté au source code
})

test('finding child elements', async ({page}) => { 
    await page.locator('nb-card nb-radio :text-is("Option 1")').click()
    await page.locator('nb-card').locator('nb-radio').locator(':text-is("Option 2")').click()
    await page.locator('nb-card').getByRole('button', {name: "Sign in"}).first().click()
    await page.locator('nb-card').nth(3).getByRole('button').click() // 4th card // NOT RECOMMENDED
})

test('finding parent elements', async ({page}) => { 
    await page.locator('nb-card', {hasText:"Using the Grid"}).getByRole('textbox', {name: "Email"}).click()
    await page.locator('nb-card', {has: page.locator('#inputEmail')}).getByRole('textbox', {name: "Email"}).click()

    await page.locator('nb-card').filter({hasText:"Basic Form"}).getByRole('textbox', {name: "Email"}).click()
    await page.locator('nb-card').filter({has: page.locator('.status-danger')}).getByRole('textbox', {name: "Password"}).click()

    await page.locator('nb-card').filter({has: page.locator('nb-checkbox')}).filter({hasText: "Sign in"}).getByRole('textbox', {name: "Email"}).click()
    await page.locator(':text-is("Using the Grid")').locator('..').getByRole('textbox', {name: "Email"}).click()
})

test('reusing locators', async ({page}) => { 
    const basicForm = page.locator('nb-card').filter({hasText:"Basic Form"})
    const emailField = basicForm.getByRole('textbox', {name: "Email"})
    await emailField.fill('test@test.com')
    await basicForm.getByRole('textbox', {name: "Password"}).fill('Welcome123')
    await basicForm.locator('nb-checkbox').click()
    await basicForm.getByRole('button').click()

    await expect(emailField).toHaveValue('test@test.com')
})

test('Extracting values', async ({page}) => { 
    //single text value
    const basicForm = page.locator('nb-card').filter({hasText:"Basic Form"})
    const buttonText = await basicForm.locator('button').textContent()

    expect(buttonText).toEqual('Submit')

    //all text values
    const allRadioButtonsLabels = await page.locator('nb-radio').allTextContents()
    expect(allRadioButtonsLabels).toContain('Option 1')

    //input field value
    const emailField = basicForm.getByRole('textbox', {name: "Email"})
    await emailField.fill('test@test.com')
    const emailValue = await emailField.inputValue()
    expect(emailValue).toEqual('test@test.com')

    // input placeholder value
    const placeholderValue = await emailField.getAttribute('placeholder')
    expect(placeholderValue).toEqual("Email")
})

test('assertions', async ({page}) => { 
    const basicFormButton = page.locator('nb-card').filter({hasText:"Basic Form"}).locator('button')

    //general assertions
    const value = 5
    expect(value).toEqual(5)

    const text = await basicFormButton.textContent()
    expect(text).toEqual("Submit")

    //locator assertions
    await expect(basicFormButton).toHaveText("Submit") //wait up to 5sec for the element to be available

    //soft assertion: test continue even if assertion fails
    await expect.soft(basicFormButton).toHaveText("Submit")
    await basicFormButton.click()
})



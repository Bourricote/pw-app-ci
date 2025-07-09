import {test, expect} from '@playwright/test'

test.beforeEach(async ({page}) => {
    await page.goto(process.env.URL) 
    await page.getByText('Button Triggering AJAX Request').click()   
})

test('auto-waiting', async({page}) => {
    const successButton = page.locator('.bg-success') // on the page the button appears after 15sec, playwright click waits for 30sec
    //await successButton.click()

    await successButton.waitFor({state: "attached"})
    const text = await successButton.allTextContents()

    expect(text).toContain('Data loaded with AJAX get request.')

    await expect(successButton).toHaveText('Data loaded with AJAX get request.', {timeout: 20000})
})

test('alternative waits', async({page}) => {
    const successButton = page.locator('.bg-success')

    //____ wait for element
    //await page.waitForSelector('.bg-success')

    //____ wait for particular response (wait for request to be completed)
    //await page.waitForResponse('http://uitestingplayground.com/ajax')

    //____ Wait for network calls to be completed (Not RECOMMENDED)
    await page.waitForLoadState('networkidle')

    //____ wait for request to be sent
    //await page.waitForRequest(?????????????)

    //____ wait for timeout (Not RECOMMENDED)
    await page.waitForTimeout(50000)

    //____ wait for particular url
    await page.waitForURL('example')

    const text = await successButton.allTextContents()
    expect(text).toContain('Data loaded with AJAX get request.')

})

test('timeouts', async({page}) => {
    const successButton = page.locator('.bg-success')
    await successButton.click()
    

})
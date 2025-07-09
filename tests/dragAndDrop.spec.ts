import {expect} from '@playwright/test'
import {test} from '../test-options'

test('drag and drop', async({page, globalsQaURL}) => {
    await page.goto(globalsQaURL) 

    const frame = page.frameLocator('[rel-title="Photo Manager"] iframe')

    //find the area where we want to drop the element
    const dropZone = frame.locator('#trash')
    await frame.locator('li', {hasText: "High Tatras 2"}).dragTo(dropZone)

    //more precise control with mouse movement
    await frame.locator('li', {hasText: "High Tatras 4"}).hover()
    await page.mouse.down() //click and maintain
    await dropZone.hover()
    await page.mouse.up() // release click
    
    await expect(dropZone.locator('li h5')).toHaveText(["High Tatras 2", "High Tatras 4"])
})
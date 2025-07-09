import { Page, expect } from '@playwright/test'
import { HelperBase } from './helperBase'

export class DatepickerPage extends HelperBase{

    constructor(page: Page){
        super(page)
    }

    async selectCommonDatepickerDateFromToday(numberOfDaysFromToday: number){
        const calendarInput = this.page.getByPlaceholder('Form Picker')
        await calendarInput.click()
    
        const dateToAssert = await this.selectDateInCalendar(numberOfDaysFromToday)
        
        await expect(calendarInput).toHaveValue(dateToAssert)
    }

    async selectDatepickerWithRangeFromToday(startDayFromToday: number, endDayFromToday: number){
        const calendarInput = this.page.getByPlaceholder('Range Picker')
        await calendarInput.click()
        const dateToAssertStart = await this.selectDateInCalendar(startDayFromToday)
        const dateToAssertEnd = await this.selectDateInCalendar(endDayFromToday)

        const dateToAssert = `${dateToAssertStart} - ${dateToAssertEnd}`

        await expect(calendarInput).toHaveValue(dateToAssert)
    }    


    private async selectDateInCalendar(numberOfDaysFromToday: number){
        let date = new Date()
        date.setDate(date.getDate() + numberOfDaysFromToday)
        const expectedDate = date.getDate().toString()
        const expectedMonthLong = date.toLocaleString('En-US', {month: 'long'})
        const expectedMonthShort = date.toLocaleString('En-US', {month: 'short'})
        const expectedYear = date.getFullYear()
        const dateToAssert = `${expectedMonthShort} ${expectedDate}, ${expectedYear}`
        const expectedMonthAndYear = `${expectedMonthLong} ${expectedYear}`
    
        let calendarMonthAndYear = await this.page.locator('nb-calendar-view-mode').textContent()
    
        while(!calendarMonthAndYear.includes(expectedMonthAndYear)){
            await this.page.locator('nb-calendar-pageable-navigation [data-name="chevron-right"]').click()
            calendarMonthAndYear = await this.page.locator('nb-calendar-view-mode').textContent()
        }
        await this.page.locator('.day-cell.ng-star-inserted').getByText(expectedDate, {exact: true}).click() 
        return dateToAssert
    }

}
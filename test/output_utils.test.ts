import * as outputUtils from '../src/output_utils'
import { getCircularReplacer } from '../src/output_utils'

describe('outputUtils', () => {
    describe('stringify', () => {
        let getCircularReplacerSpy: jest.SpyInstance

        beforeAll(() => {
            getCircularReplacerSpy = jest.spyOn(outputUtils, 'getCircularReplacer')
        })

        afterEach(() => getCircularReplacerSpy.mockClear())
        afterAll(() => getCircularReplacerSpy.mockRestore())

        it('should work properly on a non cyclic object', () => {
            const obj: any = {
                a: '1',
                b: '2',
            }

            const value = outputUtils.stringify(obj)
            expect(value).toEqual('{"a":"1","b":"2"}')
            expect(getCircularReplacerSpy).toHaveBeenCalledTimes(0)
        })

        it('should work even with circular references', () => {
            const obj: any = {
                a: '1',
                b: '2',
            }
            obj.d = obj

            const value = outputUtils.stringify(obj)
            expect(value).toEqual('{"a":"1","b":"2"}')
            expect(getCircularReplacerSpy).toHaveBeenCalled()
        })

        it('should work for a cyclic object', () => {
            let circularReference: any = { otherData: 123 }
            circularReference.myself = circularReference

            expect(outputUtils.stringify(circularReference)).toEqual('{"otherData":123}')
            expect(getCircularReplacerSpy).toHaveBeenCalled()
        })
    })

    describe('errorToJson', () => {
        it('should expose error stack through a json stringify', () => {
            const e = new Error()
            const result = outputUtils.errorToJson(e)

            expect(result.stack).toEqual(e.stack)
        })
    })
})

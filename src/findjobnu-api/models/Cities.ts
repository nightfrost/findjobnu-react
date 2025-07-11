/* tslint:disable */
/* eslint-disable */
/**
 * findjobnuAPI
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 1.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { mapValues } from '../runtime';
/**
 * 
 * @export
 * @interface Cities
 */
export interface Cities {
    /**
     * 
     * @type {number}
     * @memberof Cities
     */
    id?: number;
    /**
     * 
     * @type {string}
     * @memberof Cities
     */
    cityName?: string | null;
}

/**
 * Check if a given object implements the Cities interface.
 */
export function instanceOfCities(value: object): value is Cities {
    return true;
}

export function CitiesFromJSON(json: any): Cities {
    return CitiesFromJSONTyped(json, false);
}

export function CitiesFromJSONTyped(json: any, ignoreDiscriminator: boolean): Cities {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'] == null ? undefined : json['id'],
        'cityName': json['cityName'] == null ? undefined : json['cityName'],
    };
}

export function CitiesToJSON(json: any): Cities {
    return CitiesToJSONTyped(json, false);
}

export function CitiesToJSONTyped(value?: Cities | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'id': value['id'],
        'cityName': value['cityName'],
    };
}


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


import * as runtime from '../runtime';
import type {
  JobIndexPosts,
  JobIndexPostsPagedList,
} from '../models/index';
import {
    JobIndexPostsFromJSON,
    JobIndexPostsToJSON,
    JobIndexPostsPagedListFromJSON,
    JobIndexPostsPagedListToJSON,
} from '../models/index';

export interface GetAllJobPostsRequest {
    page?: number;
    pageSize?: number;
}

export interface GetJobPostsByIdRequest {
    id: number;
}

export interface GetJobPostsBySearchRequest {
    page: number;
    searchTerm?: string;
    location?: string;
    category?: string;
    postedAfter?: Date;
    postedBefore?: Date;
}

export interface GetSavedJobPostsByUserRequest {
    page: number;
}

/**
 * 
 */
export class JobIndexPostsApi extends runtime.BaseAPI {

    /**
     */
    async getAllJobPostsRaw(requestParameters: GetAllJobPostsRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<JobIndexPostsPagedList>> {
        const queryParameters: any = {};

        if (requestParameters['page'] != null) {
            queryParameters['page'] = requestParameters['page'];
        }

        if (requestParameters['pageSize'] != null) {
            queryParameters['pageSize'] = requestParameters['pageSize'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/api/jobindexposts`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => JobIndexPostsPagedListFromJSON(jsonValue));
    }

    /**
     */
    async getAllJobPosts(requestParameters: GetAllJobPostsRequest = {}, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<JobIndexPostsPagedList> {
        const response = await this.getAllJobPostsRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     */
    async getJobCategoriesRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Array<string>>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/api/jobindexposts/categories`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse<any>(response);
    }

    /**
     */
    async getJobCategories(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Array<string>> {
        const response = await this.getJobCategoriesRaw(initOverrides);
        return await response.value();
    }

    /**
     */
    async getJobPostsByIdRaw(requestParameters: GetJobPostsByIdRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<JobIndexPosts>> {
        if (requestParameters['id'] == null) {
            throw new runtime.RequiredError(
                'id',
                'Required parameter "id" was null or undefined when calling getJobPostsById().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/api/jobindexposts/{id}`.replace(`{${"id"}}`, encodeURIComponent(String(requestParameters['id']))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => JobIndexPostsFromJSON(jsonValue));
    }

    /**
     */
    async getJobPostsById(requestParameters: GetJobPostsByIdRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<JobIndexPosts | null | undefined > {
        const response = await this.getJobPostsByIdRaw(requestParameters, initOverrides);
        switch (response.raw.status) {
            case 200:
                return await response.value();
            case 204:
                return null;
            default:
                return await response.value();
        }
    }

    /**
     */
    async getJobPostsBySearchRaw(requestParameters: GetJobPostsBySearchRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<JobIndexPostsPagedList>> {
        if (requestParameters['page'] == null) {
            throw new runtime.RequiredError(
                'page',
                'Required parameter "page" was null or undefined when calling getJobPostsBySearch().'
            );
        }

        const queryParameters: any = {};

        if (requestParameters['searchTerm'] != null) {
            queryParameters['SearchTerm'] = requestParameters['searchTerm'];
        }

        if (requestParameters['location'] != null) {
            queryParameters['Location'] = requestParameters['location'];
        }

        if (requestParameters['category'] != null) {
            queryParameters['Category'] = requestParameters['category'];
        }

        if (requestParameters['postedAfter'] != null) {
            queryParameters['PostedAfter'] = (requestParameters['postedAfter'] as any).toISOString();
        }

        if (requestParameters['postedBefore'] != null) {
            queryParameters['PostedBefore'] = (requestParameters['postedBefore'] as any).toISOString();
        }

        if (requestParameters['page'] != null) {
            queryParameters['Page'] = requestParameters['page'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/api/jobindexposts/search`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => JobIndexPostsPagedListFromJSON(jsonValue));
    }

    /**
     */
    async getJobPostsBySearch(requestParameters: GetJobPostsBySearchRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<JobIndexPostsPagedList | null | undefined > {
        const response = await this.getJobPostsBySearchRaw(requestParameters, initOverrides);
        switch (response.raw.status) {
            case 200:
                return await response.value();
            case 204:
                return null;
            default:
                return await response.value();
        }
    }

    /**
     */
    async getSavedJobPostsByUserRaw(requestParameters: GetSavedJobPostsByUserRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<JobIndexPostsPagedList>> {
        if (requestParameters['page'] == null) {
            throw new runtime.RequiredError(
                'page',
                'Required parameter "page" was null or undefined when calling getSavedJobPostsByUser().'
            );
        }

        const queryParameters: any = {};

        if (requestParameters['page'] != null) {
            queryParameters['page'] = requestParameters['page'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/api/jobindexposts/saved`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => JobIndexPostsPagedListFromJSON(jsonValue));
    }

    /**
     */
    async getSavedJobPostsByUser(requestParameters: GetSavedJobPostsByUserRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<JobIndexPostsPagedList | null | undefined > {
        const response = await this.getSavedJobPostsByUserRaw(requestParameters, initOverrides);
        switch (response.raw.status) {
            case 200:
                return await response.value();
            case 204:
                return null;
            default:
                return await response.value();
        }
    }

}

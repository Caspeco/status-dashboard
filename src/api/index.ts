export const defaultPollingRate = 60000;

export enum System {
    Cloud = "Cloud",
    WebPlatform = "WebPlatform",
    MARC = "MARC",
    ReverseProxy = "ReverseProxy"
}

export enum Task {
    UnitTest = "Unit",
    IntegrationTest = "Integration",
    Build = "Build",
    Live = "Live"
}

export enum ResponseCode {
    Success = "Success",
    Failed = "Failed",
    Unknown = "Unknown"
}

export interface Status {
    system: System;
    task: Task;
    url: string;
    status: ResponseCode
}

export async function getStatus(status: Status) {
    try {
        const response = await fetch(status.url);
        const badge = await response.text();
        if(status.system === System.ReverseProxy && response.ok) {
            return success(status);
        }
        if(status.system === System.Cloud && status.task === Task.Live && response.ok) {
            return success(status);
        }
        if(badge.includes("succeeded") && response.ok) {
            return success(status);
        }
        if(badge.includes("failed")) {
            return failed(status);
        }
        return unknown(status);
    } catch (error) {
        return failed(status);
    }
}

export async function allBadges(urls: Status[]) {
    return Promise.all(urls.map(getStatus));
}

function success(status: Status) {
    return Object.assign({}, status, { status: ResponseCode.Success });
}

function failed(status: Status) {
    return Object.assign({}, status, { status: ResponseCode.Failed });
}

function unknown(status: Status) {
    return Object.assign({}, status, { status: ResponseCode.Unknown });
}
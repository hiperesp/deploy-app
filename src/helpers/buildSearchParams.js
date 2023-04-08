export default function buildSearchParams(params) {
    return new URLSearchParams(recursiveObjectToSearchParamsObject(params)).toString();
}

function recursiveObjectToSearchParamsObject(object, prefix = null) {
    const response = {};
    for(const key in object) {
        if(typeof object[key] === 'object') {
            Object.assign(response, recursiveObjectToSearchParamsObject(object[key], buildKey(key, prefix)));
            continue;
        }
        response[buildKey(key, prefix)] = object[key];
    }
    return response;
}

function buildKey(key, prefix) {
    if(!prefix) return key;
    return `${prefix}[${key}]`;
}
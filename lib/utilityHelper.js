export function toArray(x) {
    if (Array.isArray(x)) {
        return x;
    }
    return x ? [x] : [];
}

export function tryParseJSON(jsonString) {
    try {
        return JSON.parse(jsonString);
    } catch (err) {
        return null;
    }
}

export default {
    toArray,
    tryParseJSON
};
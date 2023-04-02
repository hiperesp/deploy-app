export default class Model {

    async refresh() {
        throw new Error('refresh not implemented');
    }

    toJson() {
        throw new Error('toJson not implemented');
    }
}
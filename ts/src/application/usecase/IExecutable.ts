export default interface IExecutable<T> {

    execute(): Promise<T>;

}
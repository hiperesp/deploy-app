interface Repository<T> {
    list(): Promise<T[]>
    create(item: T): Promise<T>
    update(item: T): Promise<T>
    delete(item: T): Promise<T>
}

export default Repository
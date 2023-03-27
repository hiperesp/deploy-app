import Namespace from '../types/Namespace'
import Repository from './Repository'

export default class NamespaceRepository implements Repository<Namespace> {
    async list(): Promise<Namespace[]> {
        return [
            {
                id: 1,
                name: 'My Namespace',

                serverHost: 'host3.gabstep.com.br',
                serverPort: 22,
                serverUsername: "",
                serverPrivateKey: "",
            },
        ]
    }
    async create(item: Namespace): Promise<Namespace> {
        throw new Error('Method not implemented.')
    }
    async update(item: Namespace): Promise<Namespace> {
        throw new Error('Method not implemented.')
    }
    async delete(item: Namespace): Promise<Namespace> {
        throw new Error('Method not implemented.')
    }
}
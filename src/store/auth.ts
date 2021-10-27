import { VuexModule } from './module';

export class AuthStore extends VuexModule.With({ namespaced: 'auth' }) {
    private _jwtToken = "";

    get token() {
        return this._jwtToken
    }

    set token(uid: string) {
        this._jwtToken = uid
    }
}
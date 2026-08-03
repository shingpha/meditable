/*!
 * meditable v0.2.1
 * Github: https://github.com/geekeditor/meditable
 * (c) 2023-2026 montisan <imontisan@gmail.com>
 * Released under the MIT License.
 */
import MEModule from '../module.js';
import resources from './locales/index.js';

class MEI18n extends MEModule {
    lang = 'en';
    resources;
    constructor(instance) {
        super(instance);
    }
    async prepare() {
        this.lang = this.instance.options.locale?.lang || 'en';
        this.resources = {
            ...resources,
            ...(this.instance.options.locale?.resources || {})
        };
        return true;
    }
    t(key) {
        const { lang, resources } = this;
        return resources[lang]?.[key] || resources.en[key] || key;
    }
    addLocales(resources, lang) {
        this.resources = {
            ...this.resources,
            ...resources
        };
        this.lang = lang || this.lang;
    }
    changeLanguage(lang) {
        this.lang = lang;
    }
}

export { MEI18n as default };

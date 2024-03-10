import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import hljs from 'highlight.js'
import 'highlight.js/styles/default.css' // Importez le style de votre choix

const app = createApp(App)

app.directive('highlightjs', {
    beforeMount: function(el, binding) {
        // Sur le montage initial, mettez en évidence le code
        let targets = el.querySelectorAll('code')
        targets.forEach((target) => {
            // Si le code n'est pas encore mis en évidence...
            if (typeof binding.value === 'string') {
                // Si la directive a une valeur, utilisez-la comme langue
                target.textContent = binding.value
                hljs.highlightBlock(target)
            } else {
                // Sinon, utilisez le langage de programmation du bloc de code
                hljs.highlightElement(target)
            }
        })
    },
    updated: function(el) {
        // Après chaque mise à jour du composant, mettez à jour le code mis en évidence
        let targets = el.querySelectorAll('code')
        targets.forEach((target) => {
            hljs.highlightElement(target)
        })
    }
})

app.use(router)

app.mount('#app')

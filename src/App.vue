<template>
  <div id="app">
    <v-app>
      <v-banner v-if="topBanner && topBanner.enabled" :color="topBanner.color" transition="slide-y-transition">
        <span :style="{ 'color': topBanner.textColor ? topBanner.textColor: undefined }">{{ topBanner.text }}</span>
        <template v-slot:actions="{ dismiss }">
          <v-btn small text @click="dismiss">{{$t('Dismiss')}}</v-btn>
        </template>
      </v-banner>
      <v-overlay :value="showOverlay" :opacity="0.1">
        <v-progress-circular size="100" indeterminate color="primary" />
      </v-overlay>
      <router-view v-if="!showOverlay" />
      <NotificationsManager />
      <v-snackbar bottom right :value="updateExists" :timeout="-1" color="primary">
        {{$t('App update is available')}}
        <v-btn text @click="refreshApp">
          {{$t('Update')}}
        </v-btn>
      </v-snackbar>
      <v-dialog v-model="showLoginPrompt" max-width="600">
        <LoginCard :showTopBar="false" />
      </v-dialog>
    </v-app>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import NotificationsManager from '@/components/NotificationsManager.vue';
import LoginCard from '@/components/LoginCard.vue';
import { readIsLoggedIn, readLocalePreference, readShowLoginPrompt, readTopBanner } from '@/store/main/getters';
import { dispatchCheckLoggedIn } from '@/store/main/actions';
import { setAppLocale } from '@/utils'; // FIXME: store locale in main.store
import { prodStateJsonURL } from './env';
import axios from 'axios';
import { commitSetShowLoginPrompt, commitSetTopBanner } from './store/main/mutations';

@Component({
  components: {
    NotificationsManager, LoginCard,
  },
})
export default class App extends Vue {
  private showOverlay = true;

  get loggedIn() {
    return readIsLoggedIn(this.$store);
  }

  get showLoginPrompt() {
    return readShowLoginPrompt(this.$store);
  }

  set showLoginPrompt(value: boolean) {
    commitSetShowLoginPrompt(this.$store, value);
  }

  get topBanner() {
    return readTopBanner(this.$store);
  }

  private registration: ServiceWorkerRegistration | null = null;
  private updateExists = false;
  private refreshing = false;

  public async created() {
    document.addEventListener('swUpdated', (event) => {
      this.registration = (event as any).detail;
      this.updateExists = true;
    }, { once: true });

    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (this.refreshing) { return; }
        this.refreshing = true;
        window.location.reload();
      });
    }

    axios.get(prodStateJsonURL).then((response) => {
      commitSetTopBanner(this.$store, response.data['top-banner']);
    });
    await dispatchCheckLoggedIn(this.$store);
    this.showOverlay = false;
    const pref = readLocalePreference(this.$store);
    if (pref) {
      setAppLocale(this, pref);
    }
  }

  private refreshApp() {
    this.updateExists = false;
    if (!this.registration || !this.registration.waiting) {
      return;
    }
    this.registration.waiting.postMessage({ type: 'SKIP_WAITING '});
  }
}
</script>

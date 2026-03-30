<template>
  <div id="captcha" />
</template>

<script setup lang="ts">
import { onMounted, watch } from "vue";

const props = defineProps<{
  captchaType: string;
  subType?: string;
  siteKey: string;
  clientSecret?: string;
  clientId2?: string;
  clientSecret2?: string;
}>();

const emit = defineEmits<{ change: [token: string] }>();

function loadScript(src: string) {
  const tag = document.createElement("script");
  tag.async = false;
  tag.src = src;
  document.body.appendChild(tag);
}

function initWidget() {
  const { captchaType, siteKey, clientSecret2, clientId2 } = props;
  const onChange = (token: string) => emit("change", token);

  switch (captchaType) {
    case "reCAPTCHA":
    case "reCAPTCHA v2": {
      const reTimer = setInterval(() => {
        if (!(window as any).grecaptcha) loadScript("https://recaptcha.net/recaptcha/api.js");
        if ((window as any).grecaptcha?.render) {
          (window as any).grecaptcha.render("captcha", { sitekey: siteKey, callback: onChange });
          clearInterval(reTimer);
        }
      }, 300);
      break;
    }
    case "reCAPTCHA v3": {
      const reTimer = setInterval(() => {
        if (!(window as any).grecaptcha) loadScript(`https://recaptcha.net/recaptcha/api.js?render=${siteKey}`);
        if ((window as any).grecaptcha?.render) {
          const clientId = (window as any).grecaptcha.render("captcha", {
            sitekey: siteKey,
            badge: "inline",
            size: "invisible",
            callback: onChange,
            "error-callback": () => {
              const el = document.getElementById("captcha");
              if (el) {
                const logoWidth = `${el.offsetWidth + 40}px`;
                const logo = document.getElementsByClassName("grecaptcha-logo")[0] as HTMLElement;
                const badge = document.getElementsByClassName("grecaptcha-badge")[0] as HTMLElement;
                if (logo?.firstChild) (logo.firstChild as HTMLElement).style.width = logoWidth;
                if (badge) badge.style.width = logoWidth;
              }
            },
          });
          (window as any).grecaptcha.ready(() => {
            (window as any).grecaptcha.execute(clientId, { action: "submit" });
          });
          clearInterval(reTimer);
        }
      }, 300);
      break;
    }
    case "hCaptcha": {
      const hTimer = setInterval(() => {
        if (!(window as any).hcaptcha) loadScript("https://js.hcaptcha.com/1/api.js");
        if ((window as any).hcaptcha?.render) {
          (window as any).hcaptcha.render("captcha", { sitekey: siteKey, callback: onChange });
          clearInterval(hTimer);
        }
      }, 300);
      break;
    }
    case "Aliyun Captcha": {
      (window as any).AliyunCaptchaConfig = { region: "cn", prefix: clientSecret2 };
      const aTimer = setInterval(() => {
        if (!(window as any).initAliyunCaptcha) {
          loadScript("https://o.alicdn.com/captcha-frontend/aliyunCaptcha/AliyunCaptcha.js");
        }
        if ((window as any).initAliyunCaptcha) {
          if (clientSecret2 && clientSecret2 !== "***") {
            (window as any).initAliyunCaptcha({
              SceneId: clientId2,
              mode: "embed",
              element: "#captcha",
              captchaVerifyCallback: (data: any) => onChange(data.toString()),
              slideStyle: { width: 320, height: 40 },
              language: "cn",
              immediate: true,
            });
          }
          clearInterval(aTimer);
        }
      }, 300);
      break;
    }
    case "GEETEST": {
      let getLock = false;
      const gTimer = setInterval(() => {
        if (!(window as any).initGeetest4) loadScript("https://static.geetest.com/v4/gt4.js");
        if ((window as any).initGeetest4 && siteKey && !getLock) {
          (window as any).initGeetest4(
            { captchaId: String(siteKey), product: "float" },
            (captchaObj: any) => {
              if (!getLock) {
                captchaObj.appendTo("#captcha");
                getLock = true;
              }
              captchaObj.onSuccess(() => {
                const r = captchaObj.getValidate();
                onChange(
                  `lot_number=${r.lot_number}&captcha_output=${r.captcha_output}&pass_token=${r.pass_token}&gen_time=${r.gen_time}&captcha_id=${siteKey}`
                );
              });
            }
          );
          clearInterval(gTimer);
        }
      }, 500);
      break;
    }
    case "Cloudflare Turnstile": {
      const tTimer = setInterval(() => {
        if (!(window as any).turnstile) {
          loadScript("https://challenges.cloudflare.com/turnstile/v0/api.js");
        }
        if ((window as any).turnstile?.render) {
          (window as any).turnstile.render("#captcha", { sitekey: siteKey, callback: onChange });
          clearInterval(tTimer);
        }
      }, 300);
      break;
    }
  }
}

onMounted(() => initWidget());
watch(() => [props.captchaType, props.subType, props.siteKey, props.clientSecret, props.clientId2, props.clientSecret2], () => initWidget());
</script>

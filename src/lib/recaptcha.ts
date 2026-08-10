declare global {
	interface Window {
		grecaptcha?: {
			ready: (callback: () => void) => void
			execute: (siteKey: string, options: { action: string }) => Promise<string>
		}
	}
}

export const getRecaptchaToken = (siteKey: string, action: string): Promise<string> => {
	return new Promise((resolve, reject) => {
		const grecaptcha = window.grecaptcha
		if (!grecaptcha) return reject('reCAPTCHA not loaded')

		grecaptcha.ready(() => {
			grecaptcha
				.execute(siteKey, { action })
				.then(resolve)
				.catch(reject)
		})
	})
}

export {}

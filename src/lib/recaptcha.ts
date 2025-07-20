export const getRecaptchaToken = (siteKey: string, action: string): Promise<string> => {
	return new Promise((resolve, reject) => {
		if (!window.grecaptcha) return reject('reCAPTCHA not loaded')

		window.grecaptcha.ready(() => {
			window.grecaptcha
				.execute(siteKey, { action })
				.then(resolve)
				.catch(reject)
		})
	})
}

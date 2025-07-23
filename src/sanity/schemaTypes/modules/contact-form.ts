import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'contact-form-module',
  title: 'Contact Form',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Form Title',
      type: 'string',
      initialValue: 'Contact Us',
    }),
    defineField({
      name: 'description',
      title: 'Form Description',
      type: 'text',
    }),
    defineField({
      name: 'endpoint',
      title: 'FormEasy Endpoint URL',
      type: 'url',
      description: 'Paste the FormEasy Web App URL (Google Script Deployment)',
      validation: (Rule) => Rule.required().uri({ scheme: ['https'] }),
    }),
    defineField({
      name: 'showRecaptcha',
      title: 'Enable reCAPTCHA?',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'reasonOptions',
      title: 'Form Reasons (Dropdown Options)',
      type: 'array',
      of: [{ type: 'string' }],
      initialValue: ['contact', 'feedback', 'referral'],
      description: 'Defines the options in the "Reason for Contact" dropdown',
    }),
  ],
  preview: {
    select: { title: 'title' },
    prepare({ title }) {
      return {
        title: title || 'Contact Form',
        subtitle: 'Module: Contact Form (FormEasy)',
      }
    },
  },
})

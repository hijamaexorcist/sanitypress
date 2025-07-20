import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'text-highlight-module', 
  title: 'Text Highlight Module',
  type: 'object',
  fields: [
    defineField({
      name: 'pretitle',
      title: 'Pretitle',
      type: 'string',
    }),
    defineField({
      name: 'text',
      title: 'Highlight Text',
      type: 'text',
      validation: (Rule) => Rule.required().min(10),
    }),
    defineField({
      name: 'alignment',
      title: 'Alignment',
      type: 'string',
      options: {
        list: [
          { title: 'Left', value: 'left' },
          { title: 'Center', value: 'center' },
          { title: 'Right', value: 'right' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'center',
    }),
  ],
})

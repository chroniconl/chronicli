/**
 * This is kind of ugly, but it's an easy way 
 * to generate the `.mdx` files for the articles.
 * 
 * @requires ArticleLayout - The layout component for the article.
 * 
 * @param {string} author - The author of the article.
 * @param {string} date - The publication date of the article in YYYY-MM-DD format.
 * @param {string} title - The title of the article.
 * @param {string} seoDescription - A short SEO-friendly description of the article.
 * @param {string} content - The full content of the article in MDX format.
 *
 * @returns {string} The complete MDX file content as a string.
 */
module.exports = function template ({ author, date, title, seoDescription, content }) {
	return (`import { ArticleLayout } from '@/components/ArticleLayout'

export const article = {
	author: '${author}',
	date: '${date}',
	title: '${title}',
	description:
	'${seoDescription}',
}

export const metadata = {
	title: article.title,
	description: article.description,
}

export default (props) => <ArticleLayout article={article} {...props} />

${content}`)
}
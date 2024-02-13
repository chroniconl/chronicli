#!/usr/bin/env node

/**
 * This is a pretty raw way of making a static blog
 * basically this is a script that is manually executed
 * it fetches all the posts from the database and writes
 * them to the `articles` directory as `.mdx` files.
 * 
 * from there; im just dragging and dropping the generated 
 * files into the `pages/articles` directory of my site
 */
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const {supabase} = require('./utils/supabase');
const template = require('./utils/template');
const { program } = require('commander');

// App version
program.version('0.1.0');

/**
 * 
 * @param {string} slug - The slug to format
 * @returns {string} - A formatted slug
 * @example
 * formatSlug('My Post');
 * // => 'my-post'
 */
function formatSlug (slug) {
	if (!slug) {
		throw new Error('Slug is required to format slug.');
	}

	var s = slug;
	// Trim trailing and leading whitespace
	s = s.trim();

	// Remove any non-alphanumeric characters
	s = s.replace(/[^a-zA-Z0-9]/g, ' ');

	// Remove special characters
	s = s.replace(/[^\w\s]/gi, '');

	// Replace multiple spaces with a single space
	s = s.replace(/\s+/g, ' ');

	// Replace spaces with a hyphen
	s = s.replace(/\s/g, '-');

	// Convert to lowercase
	s = s.toLowerCase();

	return s;
}

// Read all rows in the `posts` table
async function getPosts() {
  	const {data, error} = await supabase
		.from('posts')
		.select('*')

	if (error) {
		throw error;
	}

  	return data;
}

// Read a single row in the `posts` table
async function getPostById(id) {
	// TODO Fix this
	// const {data, error} = await supabase
	// 	.from('posts')
	// 	.select('*')
	// 	.eq('id', id)

	// if (error) {
	// 	throw error;
	// }

	// return data;
}

// Read all rows in the `posts` table without the `content` column
async function getPostsWithoutBulkyContent() {
	const {data, error} = await supabase
		.from('posts')
		.select('id, title, slug, author, created_at, updated_at')

	if (error) {
		throw error;
	}

	return data;
}

/**
 * Build a directory for the article 
 * only if it doesn't exist
 * 
 * @param {string} directory - The name of the directory to create.
 * @returns {void}
 * @throws {Error}
 * 
 * @example
 * buildDirectory('my-post');
 * // => void
 */
function buildDirectory (directory) {
	try {
		const resolvedPath = path.resolve(__dirname, `./articles/${directory}`);
		if (!fs.existsSync(resolvedPath)) {
		  fs.mkdirSync(resolvedPath);
		}
	} catch (error) {
		throw error;
	}
}
/**
 * Clean and Build articles directory
 * 
 * @returns {void}
 */
function cleanArticlesDirectory() {
	try {
		const resolvedPath = path.resolve(__dirname, `./articles`);
		if (fs.existsSync(resolvedPath)) {
			fs.rmdirSync(resolvedPath, { recursive: true });
			fs.mkdirSync(resolvedPath);
		}
		else {
			fs.mkdirSync(resolvedPath);
		}
	}
	catch (error) {
		throw error;
	}
}

/**
 * Build a file for the article
 * only if it doesn't exist
 * 
 * @param {string} slug - The slug of the post.
 * @param {string} content - The content of the post.
 * @returns {void}
 * @throws {Error}
 * 
 * @example
 * buildFile({slug: 'my-post', title: 'My Post'}, 'This is the content of my post');
 * // => void
 */

function buildFile (slug, content) {
	try {
		const resolvedPath = path.resolve(__dirname, `./articles/${slug}`);
		if (fs.existsSync(resolvedPath)) {
			fs.writeFileSync(
				path.resolve(__dirname, `./articles/${slug}/page.mdx`), 
				content
			);
		}
	} catch (error) {
		throw error;
	}
}

// Build all articles function
function buildAllArticles () {
	try {
		// Clean the articles directory
		cleanArticlesDirectory();

		// Fetch all the posts from the database
		getPosts().then(posts => {		
			// Generate the MDX files for each post
			posts.forEach(post => {
				// Format the slug of the post				
				const articleSlug = formatSlug(post.slug || post.title);
				
				// make directory based on the slug of the post
				// if it doesn't already exist
				buildDirectory(articleSlug);
	
				// Generate the content for the MDX file
				const content = template({
					author: post.author, 
					date: post.created_at, 
					lastUpdated: post.updated_at,
					title: post.title, 
					seoDescription: post.seo_description,
					content: post.content,
					tags: post.tags,
					filterableTags: post.filterable_tabs	
				});

				// Write the file to the `articles/${slug}/` directory
				// with the slug as the filename
				buildFile(articleSlug, content);
			});
		});
	}
	catch (error) {
		console.error(error);
	}
}

// Build article by id function
function buildArticleById (id) {
	try {
		// Fetch the post from the database
		getPostById(id).then(posts => {
			const post = posts[0];
			// Generate the MDX file for the post
			if (post) {
				// Format the slug of the post
				const articleSlug = formatSlug(post.slug || post.title);

				// make directory based on the slug of the post
				// if it doesn't already exist
				buildDirectory(articleSlug);

				// Generate the content for the MDX file
				const content = template({
					author: post.author, 
					date: post.created_at, 
					lastUpdated: post.updated_at,
					title: post.title, 
					seoDescription: post.seo_description,
					content: post.content,
					tags: post.tags,
					filterableTags: post.filterable_tabs	
				});

				// Write the file to the `articles/${slug}/` directory
				// with the slug as the filename
				buildFile(articleSlug, content);

			}

			if (!post) {
				console.log('No post found with that id.');
				return;
			}
		});
	}
	catch (error) {
		console.error(error);
	}
}

program
	.command('clean')
	.description('Clean articles directory')
	.action(() => {
		console.log('Cleaning articles directory...');
		cleanArticlesDirectory();
	});

program
	.command('fetch')
	.description('Fetch all articles')
	.action(() => {
		
		getPostsWithoutBulkyContent().then(posts => {			
			console.log(posts);

		});
	});

program
  .command('build')
  .description('Build all articles')
  .option('-a, --all', 'Build [all] articles')
	.option('-i, --id', 'Build article by [id]')
  .action((options) => {
		if (options.all && options.id) {
			console.log('Please specify only one option at a time.');
			return;
		}
		
		if (options.all) {
			console.log('Building all articles...');
			buildAllArticles();
		}
		
		else if (options.id) {
			console.log('Building article by id...');
			buildArticleById(options.id);
		}
	});

program
  .action(function () {
    console.log('No command specified. Use --help to see available commands and options.');
  });

// Parse the command line arguments
program.parse(process.argv);

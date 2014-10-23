///<reference path='../definitions/ref.d.ts'/>

import gutil = require('gulp-util');
import project = require('./project');
import fs = require('fs');
import path = require('path');

var libDefault = fs.readFileSync(path.join(__dirname, '../typescript/lib.d.ts')).toString('utf8');

export class Host implements ts.CompilerHost {
	private currentDirectory: string;
	private files: project.Map<project.FileData>;
	private externalResolve: boolean;
	output: project.Map<string>;
	
	constructor(currentDirectory: string, files: project.Map<project.FileData>, externalResolve: boolean) {
		this.currentDirectory = currentDirectory;
		this.files = files;
		
		this.externalResolve = externalResolve;
		
		this.reset();
	}
	
	private reset() {
		this.output = {};
	}
	
	getNewLine() {
		return '\n';
	}
	useCaseSensitiveFileNames() {
		return false;
	}
	
	getCurrentDirectory() {
		return this.currentDirectory;
	}
	getCanonicalFileName(filename: string) {
		return filename;
	}
	getDefaultLibFilename() {
		return '__lib.d.ts';
	}
	
	writeFile(filename: string, data: string, writeByteOrderMark: boolean, onError?: (message: string) => void) {
		this.output[filename] = data;
	}
	
	getSourceFile(filename: string, languageVersion: ts.ScriptTarget, onError?: (message: string) => void): ts.SourceFile {
		var text: string;
		
		filename = project.Project.normalizePath(filename);

		if (this.files[filename]) {
			if (this.files[filename] === project.Project.unresolvedFile) {
				return undefined;
			} else {
				return this.files[filename].ts;
			}
		} else if (filename === '__lib.d.ts') {
			text = libDefault;
		} else {
			if (this.externalResolve) {
				try {
					text = fs.readFileSync(filename).toString('utf8');
				} catch (ex) {
					return undefined;
				}
			}
		}
		
		if (typeof text !== 'string') return undefined;
		
		var file = ts.createSourceFile(filename, text, languageVersion, "0");
		this.files[filename] = {
			filename: filename,
			content: text,
			ts: file
		}
		return file;
	}
}

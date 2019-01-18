package com.bjlemon.day04;

import java.io.File;
import java.io.IOException;

import javax.swing.text.GapContent;

/*
 * Java.io.file
 * File类
 * 	
 * */
public class FileDemo_1 {
	public static void main(String[] args)throws IOException{
		//如何表示一个文件
		File file = new File("D:\\项目");
//		System.out.println(file);//重写了tostring
//		System.out.println(file.exists());//exists判断文件是否存在
		//判断file是文件还是目录呢
		System.out.println(file.isFile());
		System.out.println(file.isDirectory());
		//如果没有，就创建
//		if(!file.exists()) {
//			file.createNewFile();//创建一个新文件
//			file.createNewDirectory();//错误
//			file.mkdir();
		method(file);
		}
		//	遍历目录	
		public static void method(File file) {
			if(file.isFile()) {
				return ;
			}
			File []files = file.listFiles();
			for(File f:files) {
				System.out.println(f.getAbsolutePath());
				method(f);
			}
			
		}
	
	
	}


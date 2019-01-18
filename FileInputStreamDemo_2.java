package com.bjlemon.day04;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;

/**
 * 
 * @author Administrator
 *	FileInputStream
 *	
 */
public class FileInputStreamDemo_2 {
	public static void main(String[] args) throws IOException {
		/*
		 * 1、有一个文件
		 * 2、有文件流
		 * 3、处理
		 * */
		File file = new File("D:/a.java");
		FileInputStream fis = new FileInputStream(file);
		byte []bytes = new byte[5];
//		int i1 = fis.read(bytes);//返回的int，int是每次读取的字节数
//		System.out.println(i1);
//		System.out.println(new String(bytes));
//		int i2 = fis.read(bytes);
//		System.out.println(i2);
//		System.out.println(new String(bytes));
//		
//		int i3 = fis.read(bytes);
//		System.out.println(i3);
//		System.out.println(new String(bytes));
//		
		//可以用循环来做
		int temp;
		while((temp = fis.read(bytes))!=-1) {
			System.out.println(new String(bytes,0,temp));
		}
		fis.close();
		
	}
}

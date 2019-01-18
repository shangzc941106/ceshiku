package com.bjlemon.day04;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;

/**
 * @author Administrator
 *
 */
public class FileInputStreamDemo_1 {
	
	public static void main(String[] args) throws IOException{
//	1、想要文件流对文件进行操作，首先需要一个文件
		File file = new File("D:/a.java");
//		2、有文件流
		FileInputStream fis = new FileInputStream(file);//为什么要抛异常，因为如果文件不存怎么操作呢？
		//文件的输入和输出以内存为参照物，将文件上的东西读到内存中去.指针是往下移的
//		int i1 = fis.read();
//		System.out.println((char)i1);
//		int i2 = fis.read();
//		System.out.println((char)i2);
//		int i3 = fis.read();
//		System.out.println((char)i3);
//		int i4 = fis.read();
//		System.out.println((char)i4);
//		int i5 = fis.read();
//		System.out.println((char)i5);
//		int i6 = fis.read();
//		System.out.println(i6);//-1 说明后面没有内容，把-1作为判断结束的条件
//		
//		
		//一个一个读2太慢了
//		while(true) {
//			int temp = fis.read();
//			if(temp==-1) {
//				break;
//			}
//			System.out.println((char)temp);
//		}
		//升级
		int temp;
		while((temp = fis.read())!=-1) {
			System.out.println((char)temp);
		}
		fis.close();
	}
}

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
		 * 1����һ���ļ�
		 * 2�����ļ���
		 * 3������
		 * */
		File file = new File("D:/a.java");
		FileInputStream fis = new FileInputStream(file);
		byte []bytes = new byte[5];
//		int i1 = fis.read(bytes);//���ص�int��int��ÿ�ζ�ȡ���ֽ���
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
		//������ѭ������
		int temp;
		while((temp = fis.read(bytes))!=-1) {
			System.out.println(new String(bytes,0,temp));
		}
		fis.close();
		
	}
}

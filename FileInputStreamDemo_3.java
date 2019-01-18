package com.bjlemon.day04;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;

/**
 * 
 * @author Administrator
 *	把当前程序打印出来
 *
 */
public class FileInputStreamDemo_3 {
	public static void main(String[] args) throws IOException {
		
		File file = new File("D:/workspace/streamtest/src/com/bjlemon/day04/FileInputStreamDemo_3.java");
		FileInputStream fis = new FileInputStream(file);
		byte []bytes = new byte[1024];
		int temp;//计数
		int i = 0;
		while((temp = fis.read(bytes))!=-1) {

			System.out.println(new String(bytes,0,temp));
			
		}
		fis.close();
	}
}

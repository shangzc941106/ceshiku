package com.bjlemon.day04;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;

/**
 * 
 * @author Administrator
 *	
 *	要求：demo_3复制到啊a.java
 *	
 */
public class CopyDemo {
	
	public static void main(String[] args) throws IOException{
		//首先需要两个文件
		File file1 = new File("D:/workspace/streamtest/src/com/bjlemon/day04/FileInputStreamDemo_3.java");
		File file2 = new File("D:/a.java");
		//两个流
		FileInputStream fis = new FileInputStream(file1);
		FileOutputStream fos = new FileOutputStream(file2);
		//边读边写
		byte [] bytes = new byte[1024];
		int temp;//计数器
		while((temp = fis.read(bytes))!=-1) {
			fos.write(bytes,0,temp);	
		}
		fos.flush();//写在哪儿
		fis.close();
		fos.close();
		//循环为啥没有覆盖呢？所谓覆盖，是指每运行一次覆盖一次，整个循环是一个操作
	}
}

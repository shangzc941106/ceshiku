package com.bjlemon.day04;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;

/**
 * @author Administrator
 *	java.io.FileOutputStream	文件字节输出流
 *	参照物是内存，就是内存往外拿
 *	将计算机内存中的数据写到硬盘文件中
 */
public class FileOutputStreamDemo_1 {
	public static void main(String[] args) throws IOException {
		String info = "灵云";
//		File file = new File("D:/a.java");
		FileOutputStream fos = new FileOutputStream(new File("D:/a.java"),true);
		//string---->byte[]
		byte []bytes = info.getBytes();
		
		fos.write(bytes);
		fos.flush();//为了保证数据完全写入硬盘中，所以需要刷新
		fos.close();
		
	}
	
}

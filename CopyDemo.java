package com.bjlemon.day04;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;

/**
 * 
 * @author Administrator
 *	
 *	Ҫ��demo_3���Ƶ���a.java
 *	
 */
public class CopyDemo {
	
	public static void main(String[] args) throws IOException{
		//������Ҫ�����ļ�
		File file1 = new File("D:/workspace/streamtest/src/com/bjlemon/day04/FileInputStreamDemo_3.java");
		File file2 = new File("D:/a.java");
		//������
		FileInputStream fis = new FileInputStream(file1);
		FileOutputStream fos = new FileOutputStream(file2);
		//�߶���д
		byte [] bytes = new byte[1024];
		int temp;//������
		while((temp = fis.read(bytes))!=-1) {
			fos.write(bytes,0,temp);	
		}
		fos.flush();//д���Ķ�
		fis.close();
		fos.close();
		//ѭ��Ϊɶû�и����أ���ν���ǣ���ָÿ����һ�θ���һ�Σ�����ѭ����һ������
	}
}

package com.bjlemon.day04;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;

/**
 * @author Administrator
 *	java.io.FileOutputStream	�ļ��ֽ������
 *	���������ڴ棬�����ڴ�������
 *	��������ڴ��е�����д��Ӳ���ļ���
 */
public class FileOutputStreamDemo_1 {
	public static void main(String[] args) throws IOException {
		String info = "����";
//		File file = new File("D:/a.java");
		FileOutputStream fos = new FileOutputStream(new File("D:/a.java"),true);
		//string---->byte[]
		byte []bytes = info.getBytes();
		
		fos.write(bytes);
		fos.flush();//Ϊ�˱�֤������ȫд��Ӳ���У�������Ҫˢ��
		fos.close();
		
	}
	
}

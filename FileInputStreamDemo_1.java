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
//	1����Ҫ�ļ������ļ����в�����������Ҫһ���ļ�
		File file = new File("D:/a.java");
//		2�����ļ���
		FileInputStream fis = new FileInputStream(file);//ΪʲôҪ���쳣����Ϊ����ļ�������ô�����أ�
		//�ļ��������������ڴ�Ϊ��������ļ��ϵĶ��������ڴ���ȥ.ָ���������Ƶ�
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
//		System.out.println(i6);//-1 ˵������û�����ݣ���-1��Ϊ�жϽ���������
//		
//		
		//һ��һ����2̫����
//		while(true) {
//			int temp = fis.read();
//			if(temp==-1) {
//				break;
//			}
//			System.out.println((char)temp);
//		}
		//����
		int temp;
		while((temp = fis.read())!=-1) {
			System.out.println((char)temp);
		}
		fis.close();
	}
}

package com.bjlemon.day04;

import java.io.File;
import java.io.IOException;

import javax.swing.text.GapContent;

/*
 * Java.io.file
 * File��
 * 	
 * */
public class FileDemo_1 {
	public static void main(String[] args)throws IOException{
		//��α�ʾһ���ļ�
		File file = new File("D:\\��Ŀ");
//		System.out.println(file);//��д��tostring
//		System.out.println(file.exists());//exists�ж��ļ��Ƿ����
		//�ж�file���ļ�����Ŀ¼��
		System.out.println(file.isFile());
		System.out.println(file.isDirectory());
		//���û�У��ʹ���
//		if(!file.exists()) {
//			file.createNewFile();//����һ�����ļ�
//			file.createNewDirectory();//����
//			file.mkdir();
		method(file);
		}
		//	����Ŀ¼	
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


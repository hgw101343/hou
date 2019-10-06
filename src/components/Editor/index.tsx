import 'braft-editor/dist/index.css';
import 'braft-extensions/dist/color-picker.css'
import React from 'react';
import { message } from 'antd';
import BraftEditor from 'braft-editor';
import ColorPicker from 'braft-extensions/dist/color-picker';
import styles from './index.less';
import { uploadImg } from './service';

BraftEditor.use(ColorPicker({
	includeEditors: ['editor'],
	theme: 'light' // 支持dark和light两种主题，默认为dark
}))

export default class Editor extends React.Component<any, any> {
	constructor(props) {
		super(props);
		this.state= {
			editorState: ''
		}
		this.editor = React.createRef();
	}

	componentDidMount = () => {

	}

	setValue = (value) =>{
		let editorState = BraftEditor.createEditorState(value);
		this.editorInstance.setValue(editorState);
	}

	getValue = () =>{
		return this.editorInstance.getValue().toHTML();
	}

	// 不允许添加尺寸大于2M的文件
	myValidateFn = (file) => {
		let maxSize = 2 * 1024 * 1024;
		if(file.size > maxSize) {
			 message.warning('不能超过2m');
		}
		return file.size < maxSize
	}

	uploadFn = (param) => {
		const serverURL = uploadImg;
		const xhr = new XMLHttpRequest;
		const fd = new FormData();

		const successFn = (response) => {
			// 假设服务端直接返回文件上传后的地址
			// 上传成功后调用param.success并传入上传后的文件地址
			let res = JSON.parse(xhr.responseText);
			param.success({
				url: res.data[0].message,
			})
		}

		const progressFn = (event) => {
			// 上传进度发生变化时调用param.progress
			param.progress(event.loaded / event.total * 100)
		}

		const errorFn = (response) => {
			// 上传发生错误时调用param.error
			param.error({
				msg: '上传有误'
			})
		}

		xhr.upload.addEventListener("progress", progressFn, false)
		xhr.addEventListener("load", successFn, false)
		xhr.addEventListener("error", errorFn, false)
		xhr.addEventListener("abort", errorFn, false)

		fd.append('file', param.file);
		xhr.open('POST', serverURL, true);
		xhr.setRequestHeader('token', sessionStorage.getItem('token'));
		xhr.send(fd)
	}

	render() {
		const { editorState } = this.state;
		const controls = [
			'undo',
			'redo',
			'font-size',
			'text-color',
			'bold',
			'italic',
			'underline',
			'strike-through',
			'remove-styles',
			'text-align',
			'separator',
			'media',
			'fullscreen'
		]

		return (
			<div className={styles.editorWrapper} ref={this.editor}>
				<BraftEditor
					id="editor"
					value={editorState}
					controls={controls}
					contentClassName={styles.editor}
					media={{
						uploadFn: this.uploadFn,
						validateFn: this.myValidateFn,
						accepts: {
							image: 'image/png,image/jpeg,image/gif,image/webp,image/apng,image/svg'
						}
					}}
					imageControls={[]}
					ref={instance => this.editorInstance = instance}
				/>
			</div>
		)

	}

}

/* Routes:
 *   - ./src/pages/Authorized.tsx
 */
import React, { Component } from 'react';
import { Upload, Icon, Modal, message } from 'antd';
import { UploadImgProps, UploadImgState } from './declaration';
import { CommonUtils } from '@/utils/utils';
import styles from './index.less';
import { upLoadImg } from './service';
import { config } from '@/utils/config';

export default class UploadImg extends Component<UploadImgProps, UploadImgState> {
	state: UploadImgState = {
		previewVisible: false,
		previewImage: '',
		fileList: [],
		loading: false,
		headers: {
			token: sessionStorage.getItem('token'),
		},
	};

	componentDidMount = () => {
		let fileList = this.props.fileList ? CommonUtils.deepCopy(this.props.fileList) : [];
		this.setFileList(fileList);
	};

	handleCancel = () => {
		this.setState({ previewVisible: false });
	};

	componentDidUpdate(prevProps: UploadImgProps) {
		// if (this.props.fileList && this.props.fileList !== prevProps.fileList) {
		// 	this.setState({
		// 		fileList: this.props.fileList,
		// 	});
		// }
	}

	handleChange = ({ file, fileList, event }) => {
		let { maxSize = 1024 * 1024, limit = 15 } = this.props;
		let index = fileList.findIndex(item => item.uid == file.uid);
		if (file.size > maxSize) {
			// 大小限制
			let size =
				maxSize / (1024 * 1024) >= 1
					? (maxSize / (1024 * 1024)).toFixed(2) + 'M'
					: (maxSize / 1024).toFixed(2) + 'KB';
			message.warning('上传图片不能超过：' + size);
			fileList = fileList.filter(item => item.uid != file.uid);
		} else if (fileList.length > limit && index > limit - 1) {
			// 上传总数限制
			fileList = fileList.slice(0, limit);
		}

		this.setState({ fileList }, () => {
			this.props.onChange(fileList);
		});
	};

	handlePreview = async file => {
		this.setState({
			previewImage: file.url,
			previewVisible: true,
		});
	};

	beforeUpload = (file, fileList) => {
		let { maxSize = 1024 * 1024, limit = 15 } = this.props;
		let verifyUpload = true;
		if (file.size > maxSize) {
			verifyUpload = false;
		}

		let index = fileList.findIndex(item => item.uid == file.uid);
		if (fileList.length > limit && index > limit - 1) {
			verifyUpload = false;
			message.warning('上传图片数量不能超过：' + limit + '张');
		}

		return verifyUpload;
	};

	getFileList = () => {
		return this.state.fileList;
	};

	setFileList = fileList => {
		this.setState({ fileList });
	};

	handleRemove = () => {
		this.props.onChange(this.state.fileList);
	};

	customRequest = obj => {
		this.setState({ loading: true });
		let formData = new FormData();
		formData.append(obj.filename, obj.file);
		Object.keys(obj.data).forEach(item => {
			if (!CommonUtils.isEmptyOrNull(obj.data[item])) {
				formData.append(item, obj.data[item]);
			}
		});

		upLoadImg(obj.action, formData)
			.then(res => {
				try {
					if (res.data && Array.isArray(res.data)) {
						let url = res.data[0].message || res.data[0].msg;
						let { fileList } = this.state;

						let index = fileList.findIndex(item => item.uid == obj.file.uid);
						if (index > -1) {
							fileList[index].status = 'done';
							fileList[index].percent = 100;
							fileList[index].url = url;
							this.setState(
								{
									fileList,
								},
								() => {
									this.props.onChange(this.state.fileList);
									this.props.callback && this.props.callback(this.state.fileList);
								},
							);
						}
					}
				} catch (err) {
					let { fileList } = this.state;
					fileList = fileList.filter(item => item.uid != obj.file.uid);
					this.setState(
						{
							fileList,
						},
						() => {
							this.props.onChange(this.state.fileList);
						},
					);
				}
			}).catch(err => {
				let { fileList } = this.state;
				fileList = fileList.filter(item => item.uid != obj.file.uid);
				this.setState(
					{
						fileList,
					},
					() => {
						this.props.onChange(this.state.fileList);
					},
				);
			})
			.finally(() => {
				this.setState({ loading: false });
			});
	};

	render() {
		const { previewVisible, previewImage, fileList, headers, loading } = this.state;

		const {
			uploadUrl = config.SERVICE + '/api/uploadImgController/upload',
			name = 'file',
			multiple = false,
			limit = 15,
			data = {},
			listType = 'picture-card',
			children,
			placeholder = undefined,
			accept = 'image/gif,image/jpeg,image/jpg,image/png',
			showLoading = true,
		} = this.props;

		const uploadButton = (
			<div>
				{placeholder ? placeholder : null}
				{showLoading ? <Icon type={loading ? 'loading' : 'plus'} /> : null}
				{children}
			</div>
		);

		return (
			<div className={styles.uploadImg}>
				<Upload
					accept={accept}
					name={name}
					data={data}
					multiple={multiple}
					action={uploadUrl}
					listType={listType}
					fileList={fileList}
					onPreview={this.handlePreview}
					onChange={this.handleChange}
					onRemove={this.handleRemove}
					customRequest={this.customRequest}
					beforeUpload={this.beforeUpload}
				>
					{fileList.length >= limit ? null : uploadButton}
				</Upload>
				{multiple && (
					<p
						className={styles.uploadImgTip}
					>{`注：最多可上传${limit}张（${fileList.length}/${limit}）第一张默认为主图，支持拖动排序`}</p>
				)}
				<Modal
					visible={previewVisible}
					footer={null}
					closable={false}
					onCancel={this.handleCancel}
				>
					<img alt="" style={{ width: '100%' }} src={previewImage} />
				</Modal>
			</div>
		);
	}
}

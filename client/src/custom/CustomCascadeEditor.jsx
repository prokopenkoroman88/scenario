import CustomEditor from './CustomEditor.jsx';


export default class CustomCascadeEditor extends CustomEditor {

	init(){
		super.init();
		this.caption='Custom editor';
		this.editors=[];

		this.params['left-panel-width']='10px';
		this.params['right-panel-width']='10px';
	}

	get pages(){return this.editors}

	addEditor(EditorClass){
		//udali
		let editor = new EditorClass(this);
		this.editors.push(editor);
		this.component.setState({pages:this.pages});
		this.component.setState({currPage:editor});
		return editor;
	}


	newTemporaryEditor(EditorClass, caption=''){
		//let editor = new TemporaryEditor(this, EditorClass, caption);
	}

	newEditor(EditorClass){
		let editor = new EditorClass(this);
		//console.log('new Editor', editor, EditorClass);
		return editor;
	}

	openPage(EditorClass, useTemporaryClass=false, caption=''){
		//unique?
		let page;
		if(useTemporaryClass)
			page = this.newTemporaryEditor(EditorClass, caption);//for old
		else
			page = this.newEditor(EditorClass);
		return this.showPage(page);
	}

	showPage(page){
		if(this.pages.indexOf(page)<0){
			this.pages.push(page);//add
			this.component.setState({pages:this.pages});
		};
		this.component.setState({currPage:page});
		return page;
	}

	closePage(page){
		let pageIndex=this.pages.indexOf(page);
		if(pageIndex<0)
			return;
		this.pages.splice(pageIndex,1);//del
		this.component.setState({pages:this.pages});
		if(pageIndex>=this.pages.length)
			pageIndex=this.pages.length-1;
		if(pageIndex<0)
			page=null;
		else
			page=this.pages[pageIndex];
		this.component.setState({currPage:page});
	}


	getCSS(){
		let css=super.getCSS();
		css.className+=' cascade';
		if(!this.pages.length)
			css.className+=' empty';
		return css;
	}

	//getTabClass

	getPageClass(className, page){
		if(page==this.component.state.currPage)
			className+=' active';
		return className;
	}

	renderTabs(){
		//console.log('renderTabs:');
		this.pages.forEach(page=>{
			//console.log('page', page);
		});

		return (
			<div className='tabulator'>
				<div className='tab-captions'>
				{(this.pages.length) && this.pages.map((page, index)=>
					<div
						key={index}
						className={this.getPageClass('tab-caption', page)}
					>
						<span
							onClick={(()=>{  //console.log('tab', index, page);
								//console.log('caption', page.caption);
								this.component.setState({currPage:page});
							      }).bind(this)}
						>{page.caption}</span>
						<button
							onClick={(()=>{  
								//console.log('X', index, page.caption);     
								this.closePage(page);
								}).bind(this)}
						>x</button>
					</div>
				)}
				</div>
				<div className='tab-pages'>
				{(this.pages.length) && this.pages.map((page, index)=>
					<div
						key={index}
						className={this.getPageClass('tab-page', page)}
					>
						{page.render(index)}
					</div>
				)}
				</div>
			</div>
		);
	}

	renderFrameset(){
		return (
			<div className='frameset'>
				{(this.pages.length) && this.pages.map((page, index)=>
					[<div className='frame'>
						{page.render(index)}
					</div>,
					<div className='splitter'></div>]
				)}
			</div>
		);
	}

	renderGallery(){
		return (
			<div className='gallery'>
				{(this.pages.length) && this.pages.map((page, index)=>
					<div className='tab-page'>
						{page.render(index)}
					</div>
				)}
			</div>
		);
	}

	renderColumn(){
		//console.log('renderColumn:');
		this.pages.forEach((page, index)=>{
			//console.log('[',index,']', page);
		});
		return (
			<div className='column'>
				{(this.pages.length) && this.pages.map((page, index)=>
					page.render(index)
				)}
			</div>
		);
	}

	renderMain(){
		//called from CommonEditor
		switch(this.kind){
		case 'tab':
			return this.renderTabs();
		case 'frameset':
			return this.renderFrameset();
		case 'gallery':
			return this.renderGallery();
		default:
			return this.renderColumn();
		};
	}

}

import EditorItem from './../../../common/editor/EditorItem.js'

export default class FigureSelect extends EditorItem{

	constructor(editor, pool){
		super(editor, 'figureSelect');//editor=BezierEditor
		this.pool=pool;
	}

	getDefaultState(){
		return {
			opened:false,
			rect:{
				left:400,
				top:200
			},
			figureName:'',
		};
	}

	changeFigure(event){
		this.change(event, 'figureName');
	}

	link(funcs){
		if(funcs.onOK!==undefined)
			this.confirm=funcs.onOK;
		if(funcs.onCancel!==undefined)
			this.cancel=funcs.onCancel;
	}

	get name(){
		//name of selected figure
		return this.getState('figureName');
	}

	getCSS(){
		let css = super.getCSS();
		css.styles.background='orange';
		return css;
	}

	render(){
		let items = this.prepareItems(this.pool.figures, true, (figure)=>{
			return {id:figure.name, name:figure.name}
		});

		let onChange = this.changeFigure.bind(this);
		return (
			<div>
				{this.renderSelect(items, this.name, onChange)}
				{this.renderOK()}
				{this.renderCancel()}
			</div>
		)////this.confirm <= this.link <= FigureEditor.props.figure.link <= FigureEditor.openFigure
	}

}

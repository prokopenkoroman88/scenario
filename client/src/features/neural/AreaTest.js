import { Neural } from './Neural.js';
import { AreaNetwork } from './AreaNetwork.js';

class AreaTest extends AreaNetwork{// extends Neural

	load(){
		super.init();

		this.addLine('',3.2, [6, -12]);
		this.addLine('',8.5, [-14, 2]);
		this.addLine('',12, [13.4, 15.8]);
		this.addLine('',16.5, [22, -7]);
		this.addLine('',14, [-11.4, -11.8]);

		this.addClaster('',-7.0, [3, 3, 3, 0.1, 0.1]);//Верхній червоний трикутник
		this.addClaster('',-6, [-5,0,0,5,5]);//Нижній зелений трикутник

		this.editor.selectLayer('output');
		this.editor.selectNeuron('r');
		this.editor.addWeights(-2.5, [3, 0]);//r
		this.editor.selectNeuron('g');
		this.editor.addWeights(-3, [0, 4]);//g
		this.editor.selectNeuron('b');
		this.editor.addWeights(-1.0, [0, 0]);//b


		this.render.rect.right=400-1;
		this.render.rect.bottom=400-1;
		this.render.scale=5;
	}

}

export { AreaTest };

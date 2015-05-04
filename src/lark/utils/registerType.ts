//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-2015, Egret Technology Inc.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////

module lark {
    /**
     * 为一个类定义注册运行时类信息,用此方法往类定义上注册它自身以及所有接口对应的枚举值。
     * 在运行时，这个类的实例将可以使用isType()方法传入一个枚举值来判断实例类型。
     * 例如：
     * //为lark.EventEmitter类注册运行时类信息，由于它实现了IEventEmitter接口，这里应同时传入两个枚举值。
     * lark.registerType(lark.EventEmitter,[lark.Types.EventEmitter,lark.Types.IEventEmitter]);
     * var emitter = new lark.EventEmitter();
     * lark.log(emitter.isType(lark.Types.IEventEmitter));  //输出true。
     * lark.log(emitter.isType(lark.Types.EventEmitter));   //输出true。
     * lark.log(emitter.isType(lark.Types.Bitmap));   //输出false。
     *
     * @param clazz 继承自LarkObject的类定义，注意：接口在运行时不存在，因此不能传入接口定义。
     * @param typeFlags 要注册的枚举值列表。注意：传入的自定义枚举数值范围要避免与Lark引擎(1~2000的数值)或其他第三方库的数值范围重合,
     * 否则有可能会导致运行时isType()方法类型判断错误。
     */
    export function registerType(clazz:any,typeFlags:number[]):void{
        if (DEBUG) {
            if(!clazz){
                $error(1003, "clazz");
            }
            if(!typeFlags){
                $error(1003, "typeFlags");
            }
        }
        var prototype: any = clazz.prototype;
        prototype.__meta__ = typeFlags.concat(prototype.__meta__);
    }
}
'use strict';

var app = angular.module('merithon');

app.directive('stickyContainer', function($linkedlist) {
    return {
        restrict: 'A',
        scope: {},
        controller: function () {
            var linkedList = new $linkedlist();
            var count = 0;
            var lastScrollTop = 0;

            this.add = function(element) {
                var data = {
                    index: count++,
                    dom: element,
                    top: element[0].getBoundingClientRect().top
                };

                linkedList.add(data);
                return data.index;
            };

            this.remove = function(index) {
                var current = linkedList._head;
                var len = 0;
                while(current !== null) {
                    if(current.data && current.data.index === index)
                        return linkedList.remove(len);

                    len++;
                    current = current.next;
                }

                return null;
            };

            this.startOffsetTop = function(node) {
                return this.elementData(node).top || 0;
            };

            this.offsetTop = function(node) {
                var element = this.elementData(node);
                if(!element.dom)
                    return 0;

                return element.dom[0].getBoundingClientRect().top;
            };

            this.scrollTop = function(node) {
                var element = this.elementData(node);
                if(!element.dom)
                    return 0;

                return element.dom[0].scrollTop;
            };

            this.outerHeight = function(node) {
                var element = this.elementData(node);
                if(!element.dom)
                    return 0;

                return angular.element(element.dom).prop('offsetHeight');
            };

            this.elementData = function(node) {
                node = node || {};
                return node.data || {};
            };

            this.element = function(node) {
                return this.elementData(node).dom;
            };

            this.scroll = function(element) {
                var container = element[0];
                var topMargin = element[0].getBoundingClientRect().top;
                var self = this;

                if(container.scrollTop === lastScrollTop)
                    return;

                lastScrollTop = container.scrollTop;

                var current = linkedList.head();
                while(current !== null) {
                    var rhs = 0;

                    if(current && self.element(current)) {
                        if(!self.element(current).hasClass('sticky'))
                            current.data.top = self.offsetTop(current) + container.scrollTop;
                    }

                    if(self.startOffsetTop(current) <= container.scrollTop + topMargin) {
                        self.element(current).addClass('sticky');

                        rhs = self.offsetTop(current.next) - self.outerHeight(current);
                        if(self.element(current.next) && self.startOffsetTop(current) >= rhs) {
                            self.element(current).addClass("absolute");
                            self.element(current).css("top", rhs + "px");
                        }

                    } else {
                        self.element(current).removeClass('sticky');

                        rhs = self.startOffsetTop(current) - self.outerHeight(current.prev);
                        if(self.element(current.prev) && container.scrollTop + topMargin <= rhs) {
                            self.element(current.prev).removeClass("absolute");
                            self.element(current.prev).removeAttr("style");
                        }
                    }

                    current = current.next;
                }
            };
        },
        link: function(scope, element, attrs, stickyCtrl) {
            var mutex = false;
            element.bind('scroll', function() {
                if(mutex === false) {
                    mutex = true;
                    stickyCtrl.scroll(element);
                    mutex = false;
                }
            });
        }
    };
});

app.directive('stickyHeader', function() {
    return {
        restrict: 'A',
        require: '^stickyContainer',
        link: function(scope, element, attrs, stickyCtrl) {
            var cls = 'sticky-header';
            if(!element.hasClass(cls)) {

                var index = stickyCtrl.add(element);
                element.addClass(cls);

                scope.$on('$destroy', function() {
                    stickyCtrl.remove(index);
                    element.removeClass(cls);
                });
            }
        }
    };
});

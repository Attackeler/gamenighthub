import { Platform } from "react-native";

const GLOBAL_FLAG = "__gnhResponderPatched__";
const globalScope = globalThis as typeof globalThis & Record<string, boolean | undefined>;

if (Platform.OS === "web" && !globalScope[GLOBAL_FLAG]) {
  try {
    const storeModule = require("react-native-web/dist/modules/useResponderEvents/ResponderTouchHistoryStore");
    const eventTypes = require("react-native-web/dist/modules/useResponderEvents/ResponderEventTypes");
    const Store: any = storeModule?.ResponderTouchHistoryStore;

    if (Store && !Store.__gnhPatched) {
      const originalRecordTouchTrack = Store.prototype.recordTouchTrack;
      const { isEndish, isMoveish } = eventTypes;

      const ensureRecord = (touchHistory: any, touch: any, active: boolean) => {
        const identifier = touch?.identifier;
        if (identifier == null) {
          return;
        }

        const bank = touchHistory.touchBank;
        if (bank[identifier]) {
          return;
        }

        const timestamp = touch.timeStamp ?? touch.timestamp ?? Date.now();
        bank[identifier] = {
          touchActive: active,
          startPageX: touch.pageX,
          startPageY: touch.pageY,
          startTimeStamp: timestamp,
          currentPageX: touch.pageX,
          currentPageY: touch.pageY,
          currentTimeStamp: timestamp,
          previousPageX: touch.pageX,
          previousPageY: touch.pageY,
          previousTimeStamp: timestamp,
        };
      };

      Store.prototype.recordTouchTrack = function patchedRecordTouchTrack(type: string, nativeEvent: any) {
        const history = this._touchHistory;
        if (nativeEvent?.changedTouches && (isMoveish(type) || isEndish(type))) {
          const touches = Array.from(nativeEvent.changedTouches) as any[];
          touches.forEach((touch) => {
            ensureRecord(history, touch, !isEndish(type));
          });
        }

        return originalRecordTouchTrack.call(this, type, nativeEvent);
      };

      Store.__gnhPatched = true;
    }
  } catch {
    // noop
  }

  globalScope[GLOBAL_FLAG] = true;
}
